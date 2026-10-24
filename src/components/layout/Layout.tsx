import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { TourButton } from "../ui/TourButton";
import { useAuth } from "../../providers/AuthProvider";
import { navItems } from "../../config/navigation";
import {
  destroyLeadConnectorWidget,
  LEADCONNECTOR_SCRIPT_ID,
} from "../../utils/chatWidget";

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      destroyLeadConnectorWidget();
      return;
    }

    if (document.getElementById(LEADCONNECTOR_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = LEADCONNECTOR_SCRIPT_ID;
    script.src = "https://widgets.leadconnectorhq.com/loader.js";
    script.async = true;
    script.setAttribute(
      "data-resources-url",
      "https://widgets.leadconnectorhq.com/chat-widget/loader.js",
    );
    script.setAttribute("data-widget-id", "6a3566eddc5040153ac5ca45");
    document.body.appendChild(script);

    return () => {
      destroyLeadConnectorWidget();
    };
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <div className="flex pt-[72px] md:pt-[80px]">
        <Sidebar onLogout={logout} />

        <MobileNav
          isOpen={isMobileMenuOpen}
          onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          navItems={navItems}
          onLogout={logout}
        />

        <main className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <TourButton />
    </div>
  );
}
