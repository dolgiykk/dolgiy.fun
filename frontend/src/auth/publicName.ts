export function publicName(user: { username: string | null; display_name: string | null }): string {
    if (user.username) {
        return `@${user.username}`;
    }

    if (user.display_name) {
        return user.display_name;
    }

    return 'пользователь';
}
