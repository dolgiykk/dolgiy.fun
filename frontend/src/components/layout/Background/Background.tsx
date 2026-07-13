import './Background.css';

const backgrounds = Object.values(
    import.meta.glob('../../../assets/backgrounds/*.svg', {
        eager: true,
        import: 'default',
    }),
) as string[];

const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

export default function Background() {
    return (
        <div
            className="background"
            style={{
                backgroundImage: `url(${randomBackground})`,
            }}
        />
    );
}
