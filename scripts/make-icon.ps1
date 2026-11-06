Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public static class IconMaker
{
    static Bitmap Render(int size)
    {
        float s = size / 256f;
        var bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb);
        using (var g = Graphics.FromImage(bmp))
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.Clear(Color.Transparent);

            float rad = 26 * s, w = 148 * s, h = 196 * s;

            var back = new RectangleF(-74 * s, -98 * s, w, h);
            using (var p = Rounded(back, rad))
            using (var br = new LinearGradientBrush(back, Color.FromArgb(124, 92, 255), Color.FromArgb(72, 60, 190), 45f))
            {
                var st = g.Save();
                g.TranslateTransform(128 * s, 132 * s);
                g.RotateTransform(-11);
                g.FillPath(br, p);
                g.Restore(st);
            }

            var front = new RectangleF(-74 * s, -98 * s, w, h);
            using (var p = Rounded(front, rad))
            using (var br = new LinearGradientBrush(front, Color.FromArgb(38, 46, 68), Color.FromArgb(18, 23, 36), 90f))
            {
                var st = g.Save();
                g.TranslateTransform(128 * s, 124 * s);
                g.RotateTransform(7);
                g.FillPath(br, p);
                using (var pen = new Pen(Color.FromArgb(215, 124, 242, 192), Math.Max(2, 7 * s)))
                {
                    pen.Alignment = PenAlignment.Inset;
                    g.DrawPath(pen, p);
                }
                using (var f = new Font("Consolas", 66 * s, FontStyle.Bold, GraphicsUnit.Pixel))
                using (var sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center, FormatFlags = StringFormatFlags.NoWrap })
                {
                    g.DrawString("</>", f, Brushes.White, new RectangleF(-95 * s, -82 * s, 190 * s, 164 * s), sf);
                }
                g.Restore(st);
            }
        }
        return bmp;
    }

    static GraphicsPath Rounded(RectangleF r, float rad)
    {
        var p = new GraphicsPath();
        p.AddArc(r.X, r.Y, rad, rad, 180, 90);
        p.AddArc(r.Right - rad, r.Y, rad, rad, 270, 90);
        p.AddArc(r.Right - rad, r.Bottom - rad, rad, rad, 0, 90);
        p.AddArc(r.X, r.Bottom - rad, rad, rad, 90, 90);
        p.CloseFigure();
        return p;
    }

    static byte[] BmpEntry(Bitmap bmp, out int width)
    {
        width = bmp.Width;
        int w = bmp.Width, h = bmp.Height;
        var data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        var raw = new byte[w * h * 4];
        for (int y = 0; y < h; y++)
            System.Runtime.InteropServices.Marshal.Copy(
                IntPtr.Add(data.Scan0, y * data.Stride), raw, y * w * 4, w * 4);
        bmp.UnlockBits(data);

        int maskStride = ((w + 31) / 32) * 4;
        int maskSize = maskStride * h;
        using (var ms = new MemoryStream())
        using (var bw = new BinaryWriter(ms))
        {
            bw.Write(40); bw.Write(w); bw.Write(h * 2); bw.Write((short)1); bw.Write((short)32);
            bw.Write(0); bw.Write(w * h * 4 + maskSize); bw.Write(0); bw.Write(0); bw.Write(0); bw.Write(0);
            for (int y = h - 1; y >= 0; y--)
                for (int x = 0; x < w; x++)
                {
                    int i = (y * w + x) * 4;
                    bw.Write(raw[i]); // B
                    bw.Write(raw[i + 1]); // G
                    bw.Write(raw[i + 2]);     // R
                    bw.Write(raw[i + 3]); // A
                }
            bw.Write(new byte[maskSize]);
            bw.Flush();
            return ms.ToArray();
        }
    }

    public static void Make(string path)
    {
        int[] sizes = { 16, 24, 32, 48, 64, 128, 256 };
        var entries = new List<byte[]>();
        foreach (int s in sizes)
        {
            using (var bmp = Render(s))
            {
                int unused;
                entries.Add(BmpEntry(bmp, out unused));
            }
        }

        using (var fs = File.Create(path))
        using (var bw = new BinaryWriter(fs))
        {
            bw.Write((ushort)0); bw.Write((ushort)1); bw.Write((ushort)sizes.Length);
            int offset = 6 + 16 * sizes.Length;
            for (int i = 0; i < sizes.Length; i++)
            {
                bw.Write((byte)(sizes[i] >= 256 ? 0 : sizes[i]));
                bw.Write((byte)(sizes[i] >= 256 ? 0 : sizes[i]));
                bw.Write((byte)0); bw.Write((byte)0);
                bw.Write((ushort)1); bw.Write((ushort)32);
                bw.Write(entries[i].Length); bw.Write(offset);
                offset += entries[i].Length;
            }
            foreach (var e in entries) bw.Write(e);
        }
    }
}
'@

Add-Type -TypeDefinition $code -Language CSharp -ReferencedAssemblies System.Drawing, System.Drawing.Primitives, System.Runtime.InteropServices
$target = Join-Path $PSScriptRoot '..\assets\app.ico'
[IconMaker]::Make($target)
$fi = Get-Item $target
Write-Output ("icon written: " + $fi.Length + " bytes")


