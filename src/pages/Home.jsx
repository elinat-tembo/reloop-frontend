import logo from "../assets/reloop-logo.png";

function Home() {
  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-background">
      <img src={logo} alt="Reloop" className="h-16 w-auto" />
    </div>
  );
}

export default Home;
