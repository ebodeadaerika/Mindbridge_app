"""
MindBridge — Email Service
Sends transactional emails via SMTP.
If SMTP_HOST is not configured, prints the link to stdout (dev fallback).
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from html import escape as html_escape

from app.config import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(to_email: str, name: str, reset_url: str) -> None:
    """
    Send a password reset email.
    Dev fallback: if SMTP_HOST is empty, logs the reset URL to stdout instead of
    raising an error — so development works without any mail server configured.
    """
    if not settings.SMTP_HOST:
        # Console fallback for development / CI
        print(
            f"\n[MindBridge] Password reset link for {to_email}:\n  {reset_url}\n",
            flush=True,
        )
        logger.info("Password reset link (no SMTP configured): %s → %s", to_email, reset_url)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset your MindBridge password"
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email

    plain = (
        f"Hi {name},\n\n"
        "You requested a password reset for your MindBridge account.\n\n"
        f"Reset link (expires in 1 hour):\n{reset_url}\n\n"
        "If you didn't request this, you can safely ignore this email.\n\n"
        "— The MindBridge Team"
    )

    safe_name = html_escape(name)
    safe_url = html_escape(reset_url)

    html = f"""<!DOCTYPE html>
<html>
<body style="background:#0D0F14;color:#F0F2F5;font-family:Inter,Arial,sans-serif;padding:40px 20px;margin:0">
  <div style="max-width:480px;margin:0 auto">
    <h2 style="color:#00C9A7;margin:0 0 4px">MindBridge</h2>
    <h3 style="color:#F0F2F5;margin:0 0 24px">Reset your password</h3>
    <p style="color:#8B949E;line-height:1.6;margin:0 0 12px">Hi {safe_name},</p>
    <p style="color:#8B949E;line-height:1.6;margin:0 0 24px">
      You requested a password reset. Click the button below to create a new password.
      This link expires in <strong style="color:#F0F2F5">1 hour</strong>.
    </p>
    <div style="text-align:center;margin:32px 0">
      <a href="{safe_url}"
         style="background:linear-gradient(135deg,#00C9A7,#7B61FF);color:#0D0F14;font-weight:700;
                font-size:15px;padding:14px 32px;border-radius:50px;text-decoration:none;display:inline-block">
        Reset Password
      </a>
    </div>
    <p style="color:#8B949E;font-size:13px;line-height:1.6">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will remain unchanged.
    </p>
    <hr style="border:none;border-top:1px solid #30363D;margin:24px 0">
    <p style="color:#30363D;font-size:12px;margin:0">The MindBridge Team</p>
  </div>
</body>
</html>"""

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        if settings.SMTP_USE_TLS:
            server.starttls()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
