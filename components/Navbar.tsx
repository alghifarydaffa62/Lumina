
import ConnectWalletButton from "./ConnectWalletButton";

export default function Navbar() {
    return(
        <nav className="flex justify-around items-center">
            <h1 className="text-2xl font-semibold text-blue-800">Lumina</h1>

            <ul className="flex gap-10 items-center">
                <li>
                    <a href="">Home</a>
                </li>
                <li>
                    <a href="">About Lumina</a>
                </li>
                <li>
                    <a href="">features</a>
                </li>
                <li>
                    <a href="">Use Case</a>
                </li>
            </ul>

            <ConnectWalletButton />
        </nav>
    )
}