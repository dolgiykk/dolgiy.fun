@extends('emails.layout')

@section('title', 'Сброс пароля — DOLGIY.FUN')

@section('heading', 'Сброс пароля')

@section('actionText', 'Сбросить пароль')

@section('body')
    <p style="margin:0 0 12px;">
        Привет@if ($username), <strong style="color:#f8fafc;">{{ '@'.$username }}</strong>@endif!
    </p>
    <p style="margin:0;">
        Мы получили запрос на сброс пароля для вашего аккаунта. Ссылка действует ограниченное время.
    </p>
@endsection

@section('footer')
    Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
@endsection
