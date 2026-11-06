using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Web.WebView2.Core;

namespace CodeRecall;

public sealed class Bridge : IDisposable
{
    private readonly MainForm _form;
    private readonly CoreWebView2 _core;

    public Bridge(MainForm form, CoreWebView2 core)
    {
        _form = form;
        _core = core;
    }

    public async void OnMessage(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        string? id = null;
        try
        {
            using var doc = JsonDocument.Parse(e.WebMessageAsJson);
            var root = doc.RootElement;
            id = root.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;
            var cmd = root.TryGetProperty("cmd", out var c) ? c.GetString() ?? "" : "";
            var payload = root.TryGetProperty("payload", out var p) ? p : default;

            object? data = cmd switch
            {
                "state.load" => LoadState(),
                "state.save" => SaveState(payload),
                "secret.get" => GetSecret(),
                "secret.set" => SetSecret(payload),
                "secret.clear" => ClearSecret(),
                "ai.chat" => await AiChatAsync(payload),
                "ai.test" => await AiTestAsync(payload),
                "file.export" => ExportFile(payload),
                "file.import" => ImportFile(),
                "app.info" => new
                {
                    version = typeof(Bridge).Assembly.GetName().Version?.ToString(3) ?? "1.0.0",
                    dataDir = AppPaths.DataDir
                },
                "app.openData" => OpenDataFolder(),
                "app.openUrl" => OpenUrl(payload),
                "win.drag" => Drag(),
                "win.min" => Minimize(),
                "win.max" => Maximize(),
                "win.close" => Close(),
                _ => throw new InvalidOperationException($"Unknown command: {cmd}")
            };

            Reply(id, true, data, null);
        }
        catch (Exception ex)
        {
            Reply(id, false, null, ex.Message);
        }
    }

    private void Reply(string? id, bool ok, object? data, string? error)
    {
        try
        {
            var json = JsonSerializer.Serialize(new { id, ok, data, error });
            _core.PostWebMessageAsJson(json);
        }
        catch { /* webview is gone */ }
    }

    // ---- state -------------------------------------------------------------------

    private static string? LoadState()
    {
        try
        {
            if (File.Exists(AppPaths.StateBackup) && !File.Exists(AppPaths.StateFile))
                File.Copy(AppPaths.StateBackup, AppPaths.StateFile);
            return File.Exists(AppPaths.StateFile)
                ? File.ReadAllText(AppPaths.StateFile, Encoding.UTF8)
                : null;
        }
        catch
        {
            return File.Exists(AppPaths.StateBackup)
                ? File.ReadAllText(AppPaths.StateBackup, Encoding.UTF8)
                : null;
        }
    }

    private static object SaveState(JsonElement payload)
    {
        var json = payload.ValueKind == JsonValueKind.String
            ? payload.GetString() ?? "{}"
            : payload.GetRawText();

        Directory.CreateDirectory(AppPaths.DataDir);
        var tmp = AppPaths.StateFile + ".tmp";
        File.WriteAllText(tmp, json, new UTF8Encoding(false));

        if (File.Exists(AppPaths.StateFile))
        {
            try { File.Replace(tmp, AppPaths.StateFile, AppPaths.StateBackup, true); }
            catch
            {
                File.Copy(tmp, AppPaths.StateFile, true);
                File.Delete(tmp);
            }
        }
        else
        {
            File.Move(tmp, AppPaths.StateFile);
        }
        return new { saved = true };
    }

    // ---- secrets (DPAPI, current user) -------------------------------------------

    private static string? GetSecret()
    {
        try
        {
            if (!File.Exists(AppPaths.SecretsFile)) return null;
            var blob = File.ReadAllBytes(AppPaths.SecretsFile);
            var plain = ProtectedData.Unprotect(blob, null, DataProtectionScope.CurrentUser);
            return Encoding.UTF8.GetString(plain);
        }
        catch { return null; }
    }

    private static object SetSecret(JsonElement payload)
    {
        var value = payload.ValueKind == JsonValueKind.String ? payload.GetString() ?? "" : "";
        Directory.CreateDirectory(AppPaths.DataDir);
        if (string.IsNullOrWhiteSpace(value))
        {
            if (File.Exists(AppPaths.SecretsFile)) File.Delete(AppPaths.SecretsFile);
            return new { stored = false };
        }
        var blob = ProtectedData.Protect(
            Encoding.UTF8.GetBytes(value), null, DataProtectionScope.CurrentUser);
        File.WriteAllBytes(AppPaths.SecretsFile, blob);
        return new { stored = true };
    }

    private static object ClearSecret()
    {
        if (File.Exists(AppPaths.SecretsFile)) File.Delete(AppPaths.SecretsFile);
        return new { stored = false };
    }

    // ---- AI ----------------------------------------------------------------------

    private static async Task<object> AiChatAsync(JsonElement payload)
    {
        var settings = AiClient.ReadSettings(payload.GetProperty("settings"));
        var messages = new List<AiMessage>();
        foreach (var m in payload.GetProperty("messages").EnumerateArray())
        {
            messages.Add(new AiMessage(
                m.GetProperty("role").GetString() ?? "user",
                m.GetProperty("content").GetString() ?? ""));
        }
        int max = payload.TryGetProperty("maxTokens", out var mt) && mt.TryGetInt32(out var mv)
            ? Math.Clamp(mv, 200, 4000) : 1200;

        var text = await AiClient.ChatAsync(settings, messages, max);
        return new { text };
    }

    private static async Task<object> AiTestAsync(JsonElement payload)
    {
        var settings = AiClient.ReadSettings(payload);
        var text = await AiClient.ChatAsync(settings,
            new List<AiMessage> { new("user", "Reply with exactly: CONNECTED") }, 20);
        return new { text };
    }

    // ---- files -------------------------------------------------------------------

    private object? ExportFile(JsonElement payload)
    {
        var name = payload.TryGetProperty("name", out var n) ? n.GetString() ?? "coderecall.json" : "coderecall.json";
        var content = payload.TryGetProperty("content", out var c) ? c.GetString() ?? "" : "";

        using var dlg = new SaveFileDialog
        {
            Filter = "JSON files (*.json)|*.json|Text files (*.txt)|*.txt|All files (*.*)|*.*",
            FileName = name,
            Title = "Export CodeRecall data"
        };
        if (dlg.ShowDialog(_form) != DialogResult.OK) return new { saved = false };

        File.WriteAllText(dlg.FileName, content, new UTF8Encoding(false));
        return new { saved = true, path = dlg.FileName };
    }

    private object? ImportFile()
    {
        using var dlg = new OpenFileDialog
        {
            Filter = "JSON files (*.json)|*.json|All files (*.*)|*.*",
            Title = "Import CodeRecall data"
        };
        if (dlg.ShowDialog(_form) != DialogResult.OK) return new { loaded = false };

        var info = new FileInfo(dlg.FileName);
        if (info.Length > 25 * 1024 * 1024)
            throw new InvalidOperationException("That file is too large (25 MB limit).");

        return new { loaded = true, content = File.ReadAllText(dlg.FileName, Encoding.UTF8) };
    }

    private static object OpenDataFolder()
    {
        Directory.CreateDirectory(AppPaths.DataDir);
        Process.Start(new ProcessStartInfo
        {
            FileName = "explorer.exe",
            Arguments = $"\"{AppPaths.DataDir}\"",
            UseShellExecute = true
        });
        return new { opened = true };
    }

    private static object OpenUrl(JsonElement payload)
    {
        var url = payload.GetString() ?? "";
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != "https" && uri.Scheme != "http"))
            throw new InvalidOperationException("Invalid link.");
        Process.Start(new ProcessStartInfo { FileName = uri.ToString(), UseShellExecute = true });
        return new { opened = true };
    }

    // ---- window ------------------------------------------------------------------

    private object Drag() { _form.BeginDrag(); return new { ok = true }; }
    private object Minimize() { _form.WindowState = FormWindowState.Minimized; return new { ok = true }; }
    private object Maximize() { _form.ToggleMaximize(); return new { ok = true }; }
    private object Close() { _form.Close(); return new { ok = true }; }

    public void Dispose() { }
}
