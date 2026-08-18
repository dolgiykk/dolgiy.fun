<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Like;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VideoEngagementApiTest extends TestCase
{
    use RefreshDatabase;

    private const VIDEO_ID = 'e4bca09605bc08619d9f75b17e95a45c';

    public function test_guest_can_view_engagement(): void
    {
        $author = User::factory()->create([
            'username' => 'dolgiy_fan',
        ]);

        Comment::query()->create([
            'user_id' => $author->id,
            'video_id' => self::VIDEO_ID,
            'body' => 'Огонь озвучка',
        ]);

        Like::query()->create([
            'user_id' => $author->id,
            'video_id' => self::VIDEO_ID,
        ]);

        $this->getJson('/api/videos/'.self::VIDEO_ID.'/engagement')
            ->assertOk()
            ->assertJsonPath('data.likes_count', 1)
            ->assertJsonPath('data.liked', false)
            ->assertJsonPath('data.comments_count', 1)
            ->assertJsonPath('data.has_more', false)
            ->assertJsonPath('data.comments.0.body', 'Огонь озвучка')
            ->assertJsonPath('data.comments.0.user.username', 'dolgiy_fan');
    }

    public function test_invalid_video_id_returns_not_found(): void
    {
        $this->getJson('/api/videos/bad/engagement')->assertNotFound();
    }

    public function test_guest_cannot_like_or_comment(): void
    {
        $this->postJson('/api/videos/'.self::VIDEO_ID.'/likes')->assertUnauthorized();
        $this->deleteJson('/api/videos/'.self::VIDEO_ID.'/likes')->assertUnauthorized();
        $this->postJson('/api/videos/'.self::VIDEO_ID.'/comments', [
            'body' => 'Привет',
        ])->assertUnauthorized();
    }

    public function test_user_can_like_and_unlike(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/videos/'.self::VIDEO_ID.'/likes')
            ->assertOk()
            ->assertJsonPath('data.liked', true)
            ->assertJsonPath('data.likes_count', 1);

        $this->actingAs($user)
            ->postJson('/api/videos/'.self::VIDEO_ID.'/likes')
            ->assertOk()
            ->assertJsonPath('data.likes_count', 1);

        $this->actingAs($user)
            ->getJson('/api/videos/'.self::VIDEO_ID.'/engagement')
            ->assertOk()
            ->assertJsonPath('data.liked', true)
            ->assertJsonPath('data.likes_count', 1);

        $this->actingAs($user)
            ->deleteJson('/api/videos/'.self::VIDEO_ID.'/likes')
            ->assertOk()
            ->assertJsonPath('data.liked', false)
            ->assertJsonPath('data.likes_count', 0);
    }

    public function test_user_can_comment_newest_first(): void
    {
        $user = User::factory()->create([
            'username' => 'commenter',
        ]);

        $this->actingAs($user)
            ->postJson('/api/videos/'.self::VIDEO_ID.'/comments', [
                'body' => '  Первый  ',
            ])
            ->assertCreated()
            ->assertJsonPath('data.body', 'Первый')
            ->assertJsonPath('data.user.username', 'commenter');

        $this->actingAs($user)
            ->postJson('/api/videos/'.self::VIDEO_ID.'/comments', [
                'body' => 'Второй',
            ])
            ->assertCreated();

        $this->getJson('/api/videos/'.self::VIDEO_ID.'/engagement')
            ->assertOk()
            ->assertJsonPath('data.comments.0.body', 'Второй')
            ->assertJsonPath('data.comments.1.body', 'Первый');
    }

    public function test_comments_are_paginated_with_show_more_cursor(): void
    {
        $user = User::factory()->create();

        foreach (['один', 'два', 'три', 'четыре', 'пять', 'шесть'] as $body) {
            Comment::query()->create([
                'user_id' => $user->id,
                'video_id' => self::VIDEO_ID,
                'body' => $body,
            ]);
        }

        $firstPage = $this->getJson('/api/videos/'.self::VIDEO_ID.'/engagement')
            ->assertOk()
            ->assertJsonPath('data.comments_count', 6)
            ->assertJsonPath('data.has_more', true)
            ->assertJsonCount(5, 'data.comments')
            ->assertJsonPath('data.comments.0.body', 'шесть')
            ->assertJsonPath('data.comments.4.body', 'два');

        $oldestId = $firstPage->json('data.comments.4.id');

        $this->getJson('/api/videos/'.self::VIDEO_ID.'/engagement?before='.$oldestId)
            ->assertOk()
            ->assertJsonPath('data.has_more', false)
            ->assertJsonCount(1, 'data.comments')
            ->assertJsonPath('data.comments.0.body', 'один');
    }

    public function test_empty_comment_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/videos/'.self::VIDEO_ID.'/comments', [
                'body' => '   ',
            ])
            ->assertUnprocessable();
    }

    public function test_user_without_username_cannot_comment(): void
    {
        $user = User::factory()->withoutUsername()->create();

        $this->actingAs($user)
            ->postJson('/api/videos/'.self::VIDEO_ID.'/comments', [
                'body' => 'Нельзя',
            ])
            ->assertUnprocessable();
    }

    public function test_user_can_delete_own_comment_but_not_others(): void
    {
        $author = User::factory()->create();
        $stranger = User::factory()->create();

        $own = Comment::query()->create([
            'user_id' => $author->id,
            'video_id' => self::VIDEO_ID,
            'body' => 'Мой',
        ]);

        $foreign = Comment::query()->create([
            'user_id' => $stranger->id,
            'video_id' => self::VIDEO_ID,
            'body' => 'Чужой',
        ]);

        $this->actingAs($author)
            ->deleteJson('/api/comments/'.$foreign->id)
            ->assertForbidden();

        $this->actingAs($author)
            ->deleteJson('/api/comments/'.$own->id)
            ->assertOk();

        $this->assertDatabaseMissing('comments', [
            'id' => $own->id,
        ]);
    }

    public function test_admin_can_delete_any_comment(): void
    {
        $author = User::factory()->create();
        $admin = User::factory()->admin()->create();

        $comment = Comment::query()->create([
            'user_id' => $author->id,
            'video_id' => self::VIDEO_ID,
            'body' => 'Удалить',
        ]);

        $this->actingAs($admin)
            ->deleteJson('/api/comments/'.$comment->id)
            ->assertOk();

        $this->assertDatabaseMissing('comments', [
            'id' => $comment->id,
        ]);
    }
}
