<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <title>@yield('title', 'DOLGIY.FUN')</title>
</head>
<body style="margin:0;padding:0;background:#060914;color:#f8fafc;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#060914;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;border:1px solid rgba(255,255,255,0.14);border-radius:24px;background:#0d1426;overflow:hidden;">
                    <tr>
                        <td style="padding:28px 28px 8px;background-color:#121a31;">
                            <p style="margin:0;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#ffb703;">
                                DOLGIY.FUN
                            </p>
                            <h1 style="margin:14px 0 0;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:28px;line-height:1.2;font-weight:800;color:#f8fafc;">
                                @yield('heading')
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 28px 8px;font-size:16px;line-height:1.6;color:#a8b3cf;">
                            @yield('body')
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:12px 28px 28px;" align="center">
                            <a href="{{ $actionUrl }}" style="display:inline-block;padding:14px 28px;border-radius:14px;background:#ffb703;color:#080c18;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:15px;font-weight:800;text-decoration:none;">
                                @yield('actionText')
                            </a>
                            <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#a8b3cf;word-break:break-all;">
                                Если кнопка не открывается, перейдите по ссылке:<br>
                                <a href="{{ $actionUrl }}" style="color:#22d3ee;text-decoration:underline;">{{ $actionUrl }}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 28px 28px;font-size:13px;line-height:1.5;color:#7f8aad;">
                            @yield('footer')
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
