import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-gray-50">
      <div className="mx-auto container px-5 py-3">
        <NavLink
          className="flex justify-center items-center"
          to="/">
          <img className="w-24" src="./logo.jpg" alt="logotipo" />
        </NavLink>
      </div>
    </header>
  )
}
