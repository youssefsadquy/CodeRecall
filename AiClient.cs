using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace CodeRecall;

public sealed record AiMessage(string role, string content);

public sealed class AiSettings
{
    public string Provider { get; init; } = "free";
    public string Model { get; init; } = "";
    public string Key { get; init; } = "";
    public string BaseUrl { get; init; } = "";
}

public static class AiClient
{
    private static readonly HttpClient Http = CreateClient();

    private static HttpClient CreateClient()
    {
        var handler = new SocketsHttpHandler
        {
            PooledConnectionLifetime = TimeSpan.FromMinutes(5),
            AutomaticDecompression = System.Net.DecompressionMethods.All
        };
        var client = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(120) };
        client.DefaultRequestHeaders.UserAgent.ParseAdd("CodeRecall/1.0");
        return client;
    }

    public static AiSettings ReadSettings(JsonElement e) => new()
    {
        Provider = e.TryGetProperty("provider", out var p) ? p.GetString() ?? "free" : "free",
        Model = e.TryGetProperty("model", out var m) ? m.GetString() ?? "" : "",
        Key = e.TryGetProperty("key", out var k) ? k.GetString() ?? "" : "",
        BaseUrl = e.TryGetProperty("baseUrl", out var b) ? b.GetString() ?? "" : ""
    };

    public static async Task<string> ChatAsync(
        AiSettings s, IReadOnlyList<AiMessage> messages, int maxTokens)
    {
        if (string.Equals(s.Provider, "offline", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Offline mode is active — no AI request was sent.");

        var (url, model) = Resolve(s);
        var body = new Dictionary<string, object>
        {
            ["model"] = model,
            ["messages"] = messages.Select(m => new { role = m.role, content = m.content }).ToArray(),
            ["temperature"] = 0.6,
            ["max_tokens"] = maxTokens,
            ["stream"] = false
        };

        string? lastError = null;
        for (int attempt = 0; attempt < 2; attempt++)
        {
            try
            {
                using var req = new HttpRequestMessage(HttpMethod.Post, url);
                req.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
                if (!string.IsNullOrWhiteSpace(s.Key) && s.Provider != "free")
                    req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", s.Key.Trim());
                if (s.Provider == "openrouter")
                {
                    req.Headers.TryAddWithoutValidation("HTTP-Referer", "https://coderecall.app");
                    req.Headers.TryAddWithoutValidation("X-Title", "CodeRecall");
                }

                using var res = await Http.SendAsync(req);
                var text = await res.Content.ReadAsStringAsync();

                if (!res.IsSuccessStatusCode)
                {
                    lastError = FriendlyError((int)res.StatusCode, text, s.Provider);
                    if ((int)res.StatusCode is 429 or >= 500 && attempt == 0)
                    {
                        await Task.Delay(900);
                        continue;
                    }
                    throw new InvalidOperationException(lastError);
                }

                var parsed = ExtractContent(text);
                if (!string.IsNullOrWhiteSpace(parsed)) return parsed.Trim();
                lastError = "The AI returned an empty response.";
            }
            catch (TaskCanceledException)
            {
                lastError = "The AI request timed out. Free AI can be slow — try again.";
            }
            catch (HttpRequestException ex)
            {
                lastError = s.Provider == "ollama"
                    ? "Could not reach Ollama at localhost:11434. Is `ollama serve` running?"
                    : $"Network error: {ex.Message}";
            }

            if (attempt == 0 && s.Provider == "free" && lastError != null)
            {
                await Task.Delay(700);
                continue;
            }
            break;
        }

        // Last-resort simple GET for the keyless free provider.
        if (s.Provider == "free")
        {
            try
            {
                var prompt = messages.LastOrDefault(m => m.role == "user")?.content ?? "";
                var system = messages.FirstOrDefault(m => m.role == "system")?.content ?? "";
                var getUrl = "https://text.pollinations.ai/" + Uri.EscapeDataString(prompt) +
                             "?model=openai" +
                             (system.Length > 0 ? "&system=" + Uri.EscapeDataString(system) : "");
                var fallback = await Http.GetStringAsync(getUrl);
                if (!string.IsNullOrWhiteSpace(fallback)) return fallback.Trim();
            }
            catch { /* fall through */ }
        }

        throw new InvalidOperationException(lastError ?? "The AI request failed.");
    }

    private static (string url, string model) Resolve(AiSettings s)
    {
        var provider = (s.Provider ?? "free").ToLowerInvariant();
        return provider switch
        {
            "free" => ("https://text.pollinations.ai/openai",
                       string.IsNullOrWhiteSpace(s.Model) ? "openai" : s.Model),
            "openrouter" => ("https://openrouter.ai/api/v1/chat/completions",
                       string.IsNullOrWhiteSpace(s.Model) ? "deepseek/deepseek-chat-v3-0324:free" : s.Model),
            "groq" => ("https://api.groq.com/openai/v1/chat/completions",
                       string.IsNullOrWhiteSpace(s.Model) ? "llama-3.3-70b-versatile" : s.Model),
            "gemini" => ("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                       string.IsNullOrWhiteSpace(s.Model) ? "gemini-2.0-flash" : s.Model),
            "ollama" => ("http://localhost:11434/v1/chat/completions",
                       string.IsNullOrWhiteSpace(s.Model) ? "llama3.2" : s.Model),
            "custom" => (NormalizeBase(s.BaseUrl),
                       string.IsNullOrWhiteSpace(s.Model) ? "gpt-4o-mini" : s.Model),
            _ => throw new InvalidOperationException($"Unknown AI provider '{s.Provider}'.")
        };
    }

    private static string NormalizeBase(string baseUrl)
    {
        if (string.IsNullOrWhiteSpace(baseUrl))
            throw new InvalidOperationException("Add a base URL for the custom provider.");
        var url = baseUrl.Trim().TrimEnd('/');
        if (url.EndsWith("/chat/completions", StringComparison.OrdinalIgnoreCase)) return url;
        if (url.EndsWith("/v1", StringComparison.OrdinalIgnoreCase)) return url + "/chat/completions";
        return url + "/v1/chat/completions";
    }

    private static string ExtractContent(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (root.TryGetProperty("error", out var err))
        {
            var msg = err.ValueKind == JsonValueKind.Object && err.TryGetProperty("message", out var em)
                ? em.GetString() : err.ToString();
            throw new InvalidOperationException(msg ?? "The AI provider returned an error.");
        }

        if (!root.TryGetProperty("choices", out var choices) ||
            choices.ValueKind != JsonValueKind.Array || choices.GetArrayLength() == 0)
            return "";

        var first = choices[0];
        if (!first.TryGetProperty("message", out var message)) return "";
        if (!message.TryGetProperty("content", out var content)) return "";

        if (content.ValueKind == JsonValueKind.String)
            return content.GetString() ?? "";

        if (content.ValueKind == JsonValueKind.Array)
        {
            var sb = new StringBuilder();
            foreach (var part in content.EnumerateArray())
                if (part.TryGetProperty("text", out var t)) sb.Append(t.GetString());
            return sb.ToString();
        }
        return "";
    }

    private static string FriendlyError(int status, string body, string provider)
    {
        var detail = "";
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("error", out var err))
                detail = err.ValueKind == JsonValueKind.Object && err.TryGetProperty("message", out var m)
                    ? m.GetString() ?? "" : err.ToString();
        }
        catch { detail = body.Length > 300 ? body[..300] : body; }

        return status switch
        {
            401 or 403 => $"That API key was rejected by {provider}. Check it in Settings.",
            402 => "This model needs credits. Try the free provider or another model.",
            404 => $"Model not found on {provider}. Check the model name in Settings.",
            429 => "Rate limit reached. Wait a minute, or switch to another AI provider.",
            _ => $"AI error {status}: {detail}"
        };
    }
}
