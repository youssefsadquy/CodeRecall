namespace CodeRecall;

public static class AppPaths
{
    public static string DataDir { get; } = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "CodeRecall");

    public static string StateFile => Path.Combine(DataDir, "state.json");
    public static string StateBackup => Path.Combine(DataDir, "state.backup.json");
    public static string SecretsFile => Path.Combine(DataDir, "secrets.dat");
    public static string WebDir => Path.Combine(DataDir, "web");

    /// <summary>Writes the embedded HTML/CSS/JS to disk so WebView2 can serve it
    /// from a stable https://app.local origin.</summary>
    public static string ExtractWebAssets()
    {
        Directory.CreateDirectory(WebDir);
        var asm = typeof(AppPaths).Assembly;
        foreach (var name in asm.GetManifestResourceNames())
        {
            if (!name.StartsWith("web/", StringComparison.Ordinal)) continue;
            var rel = name.Substring(4).Replace('/', Path.DirectorySeparatorChar);
            var dest = Path.Combine(WebDir, rel);
            Directory.CreateDirectory(Path.GetDirectoryName(dest)!);
            using var src = asm.GetManifestResourceStream(name)!;
            using var dst = File.Create(dest);
            src.CopyTo(dst);
        }
        return WebDir;
    }
}
