import Header from './components/layout/Header/Header';
import Hero from './components/sections/Hero/Hero';
import Footer from './components/layout/Footer/Footer';
import Container from './components/layout/Container/Container';
import Background from './components/layout/Background/Background';

export default function App() {
    return (
        <>
            <Background />

            <Header />

            <main className="page">
                <Container>
                    <Hero />
                </Container>
            </main>

            <Footer />
        </>
    );
}
