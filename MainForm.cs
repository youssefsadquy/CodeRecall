using System.Drawing;
using System.Runtime.InteropServices;
using System.Text;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace CodeRecall;

public sealed class MainForm : Form
{
    private readonly WebView2 _web = new();
    private Bridge? _bridge;
    private bool _ready;

    public MainForm()
    {
        Text = "CodeRecall";
        FormBorderStyle = FormBorderStyle.None;
        StartPosition = FormStartPosition.CenterScreen;
        MinimumSize = new Size(1024, 680);
        Size = new Size(1340, 880);
        BackColor = Color.FromArgb(11, 14, 20);
        KeyPreview = true;
        DoubleBuffered = true;
        AutoScaleMode = AutoScaleMode.Dpi;

        _web.Dock = DockStyle.Fill;
        _web.DefaultBackgroundColor = Color.FromArgb(11, 14, 20);
        Controls.Add(_web);

        Load += OnLoadAsync;
        Resize += (_, _) => PushWindowState();
        FormClosed += (_, _) => _bridge?.Dispose();
    }

    private async void OnLoadAsync(object? sender, EventArgs e)
    {
        try
        {
            var dataDir = AppPaths.DataDir;
            Directory.CreateDirectory(dataDir);

            var env = await CoreWebView2Environment.CreateAsync(
                null, Path.Combine(dataDir, "webview"));

            await _web.EnsureCoreWebView2Async(env);
            var core = _web.CoreWebView2;
            core.Settings.AreDevToolsEnabled = Environment.GetEnvironmentVariable("CODERECALL_DEV") == "1";
            core.Settings.AreDefaultContextMenusEnabled = false;
            core.Settings.IsStatusBarEnabled = false;
            core.Settings.IsZoomControlEnabled = false;
            core.Settings.IsSwipeNavigationEnabled = false;
            core.Settings.AreBrowserAcceleratorKeysEnabled = false;

            var webDir = AppPaths.ExtractWebAssets();
            core.SetVirtualHostNameToFolderMapping(
                "app.local", webDir, CoreWebView2HostResourceAccessKind.Allow);

            _bridge = new Bridge(this, core);
            core.WebMessageReceived += _bridge.OnMessage;

            core.NavigationCompleted += (_, args) =>
            {
                if (!args.IsSuccess)
                {
                    MessageBox.Show("The interface failed to load. Try restarting CodeRecall.\r\n" +
                                    args.WebErrorStatus, "CodeRecall");
                }
            };

            core.Navigate("https://app.local/index.html");
            _ready = true;
        }
        catch (Exception ex)
        {
            Program.Crash(ex);
            Close();
        }
    }

    public void PushWindowState()
    {
        if (!_ready || _web.CoreWebView2 is null) return;
        var state = WindowState == FormWindowState.Maximized ? "max" : "normal";
        try
        {
            _web.CoreWebView2.ExecuteScriptAsync(
                $"window.__winState && window.__winState('{state}')");
        }
        catch { /* window may be closing */ }
    }

    public void ToggleMaximize()
    {
        WindowState = WindowState == FormWindowState.Maximized
            ? FormWindowState.Normal
            : FormWindowState.Maximized;
        PushWindowState();
    }

    // ---- borderless window plumbing -------------------------------------------------

    private const int WM_NCCALCSIZE = 0x0083;
    private const int WM_NCHITTEST = 0x0084;
    private const int WM_NCLBUTTONDOWN = 0x00A1;
    private const int HTCAPTION = 2;
    private const int HTLEFT = 10, HTRIGHT = 11, HTTOP = 12, HTTOPLEFT = 13,
        HTTOPRIGHT = 14, HTBOTTOM = 15, HTBOTTOMLEFT = 16, HTBOTTOMRIGHT = 17;
    private const int RESIZE_BORDER = 6;

    [DllImport("user32.dll")]
    private static extern bool ReleaseCapture();

    [DllImport("user32.dll")]
    private static extern IntPtr SendMessage(IntPtr hWnd, int msg, IntPtr wParam, IntPtr lParam);

    [DllImport("dwmapi.dll")]
    private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

    public void BeginDrag()
    {
        ReleaseCapture();
        SendMessage(Handle, WM_NCLBUTTONDOWN, (IntPtr)HTCAPTION, IntPtr.Zero);
    }

    protected override CreateParams CreateParams
    {
        get
        {
            var cp = base.CreateParams;
            cp.Style |= 0x00040000;      // WS_THICKFRAME: enables native resizing
            cp.ClassStyle |= 0x00020000; // CS_DROPSHADOW
            return cp;
        }
    }

    protected override void OnHandleCreated(EventArgs e)
    {
        base.OnHandleCreated(e);
        try
        {
            int round = 2; // DWMWCP_ROUND
            DwmSetWindowAttribute(Handle, 33, ref round, sizeof(int));
            int dark = 1;
            DwmSetWindowAttribute(Handle, 20, ref dark, sizeof(int));
        }
        catch { /* Windows 10 and older */ }
    }

    protected override void WndProc(ref Message m)
    {
        if (m.Msg == WM_NCCALCSIZE && m.WParam != IntPtr.Zero)
        {
            if (WindowState == FormWindowState.Maximized)
            {
                base.WndProc(ref m);
                return;
            }
            m.Result = IntPtr.Zero;
            return;
        }

        if (m.Msg == WM_NCHITTEST && WindowState != FormWindowState.Maximized)
        {
            base.WndProc(ref m);
            var p = PointToClient(new Point((short)(m.LParam.ToInt64() & 0xFFFF),
                                            (short)((m.LParam.ToInt64() >> 16) & 0xFFFF)));
            bool left = p.X <= RESIZE_BORDER, right = p.X >= ClientSize.Width - RESIZE_BORDER;
            bool top = p.Y <= RESIZE_BORDER, bottom = p.Y >= ClientSize.Height - RESIZE_BORDER;

            if (left && top) m.Result = (IntPtr)HTTOPLEFT;
            else if (right && top) m.Result = (IntPtr)HTTOPRIGHT;
            else if (left && bottom) m.Result = (IntPtr)HTBOTTOMLEFT;
            else if (right && bottom) m.Result = (IntPtr)HTBOTTOMRIGHT;
            else if (left) m.Result = (IntPtr)HTLEFT;
            else if (right) m.Result = (IntPtr)HTRIGHT;
            else if (top) m.Result = (IntPtr)HTTOP;
            else if (bottom) m.Result = (IntPtr)HTBOTTOM;
            return;
        }

        base.WndProc(ref m);
    }
}
