import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/img/affordablewellness_logo_v1.png";

export function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center"
    >
      <img
        src={logo}
        alt="Affordable Wellness"
        className=" h-16 w-auto md:h-16 logo_my"
      />
    </Link>
  );
}
