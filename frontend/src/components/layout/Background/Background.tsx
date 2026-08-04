import './Background.css';

const backgrounds = Object.values(
    import.meta.glob('../../../assets/backgrounds/*.svg', {
        eager: true,
        query: '?url',
        import: 'default',
    }),
) as string[];

const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

export default function Background() {
    return (
        <div className="background" aria-hidden="true">
            <div className="background__spotlight background__spotlight--gold" />
            <div className="background__spotlight background__spotlight--pink" />
            <div
                className="background__poster"
                style={{
                    backgroundImage: `url("${randomBackground}")`,
                }}
            />
        </div>
    );
}
