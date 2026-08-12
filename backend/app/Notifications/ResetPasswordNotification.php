<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $frontend = rtrim((string) config('app.frontend_url'), '/');
        $url = "{$frontend}/reset-password?token={$this->token}&email=".urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Сброс пароля — DOLGIY.FUN')
            ->view('emails.reset-password', [
                'actionUrl' => $url,
                'username' => $notifiable->username,
            ]);
    }
}
