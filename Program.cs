using System.Text;

namespace CodeRecall;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.ThreadException += (_, e) => Crash(e.Exception);
        AppDomain.CurrentDomain.UnhandledException += (_, e) => Crash(e.ExceptionObject as Exception);
        Application.Run(new MainForm());
    }

    internal static void Crash(Exception? ex)
    {
        try
        {
            var dir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "CodeRecall");
            Directory.CreateDirectory(dir);
            File.AppendAllText(Path.Combine(dir, "error.log"),
                $"[{DateTime.Now:u}] {ex}\r\n\r\n", Encoding.UTF8);
        }
        catch { /* ignore */ }

        MessageBox.Show(
            "CodeRecall hit an unexpected error. Details were written to:\r\n" +
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "CodeRecall", "error.log"),
            "CodeRecall", MessageBoxButtons.OK, MessageBoxIcon.Error);
    }
}
