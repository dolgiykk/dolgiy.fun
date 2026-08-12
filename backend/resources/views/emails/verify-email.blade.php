@extends('emails.layout')

@section('title', 'Подтверждение email — DOLGIY.FUN')

@section('heading', 'Подтвердите email')

@section('actionText', 'Подтвердить email')

@section('body')
    <p style="margin:0 0 12px;">
        Привет@if ($username), <strong style="color:#f8fafc;">{{ '@'.$username }}</strong>@endif!
    </p>
    <p style="margin:0;">
        Нажмите кнопку ниже, чтобы подтвердить адрес и активировать аккаунт.
    </p>
@endsection

@section('footer')
    Если вы не регистрировались на dolgiy.fun, просто проигнорируйте это письмо.
@endsection
