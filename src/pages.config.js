/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import Boutique from './pages/Boutique';
import CGU from './pages/CGU';
import CGV from './pages/CGV';
import CRM from './pages/CRM';
import CalendarView from './pages/CalendarView';
import ClientDashboard from './pages/ClientDashboard';
import Contact from './pages/Contact';
import EventPublic from './pages/EventPublic';
import Home from './pages/Home';
import MentionsLegales from './pages/MentionsLegales';
import OrderTracking from './pages/OrderTracking';
import Quotes from './pages/Quotes';
import ReviewOrder from './pages/ReviewOrder';
import Stats from './pages/Stats';
import SupplierOrders from './pages/SupplierOrders';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminOrdersDetail from './pages/AdminOrdersDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AdminOrders": AdminOrders,
    "Boutique": Boutique,
    "CGU": CGU,
    "CGV": CGV,
    "CRM": CRM,
    "CalendarView": CalendarView,
    "ClientDashboard": ClientDashboard,
    "Contact": Contact,
    "EventPublic": EventPublic,
    "Home": Home,
    "MentionsLegales": MentionsLegales,
    "OrderTracking": OrderTracking,
    "Quotes": Quotes,
    "ReviewOrder": ReviewOrder,
    "Stats": Stats,
    "SupplierOrders": SupplierOrders,
    "OrderConfirmation": OrderConfirmation,
    "AdminOrdersDetail": AdminOrdersDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};