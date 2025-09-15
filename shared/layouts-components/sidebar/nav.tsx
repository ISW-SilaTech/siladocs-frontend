

import SpkBadge from "@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge";
import * as Svgicons from "./menusvg-icons";

const badgePrimary = <SpkBadge variant="" Customclass="bg-primary-transparent ms-2">9</SpkBadge>
const badgeSucccess = <SpkBadge variant="" Customclass="bg-success-transparent ms-2">6</SpkBadge>
const badgeWarning = <SpkBadge variant="" Customclass="bg-warning-transparent ms-2">5</SpkBadge>
const badgeInfo = <SpkBadge variant="" Customclass="bg-info-transparent ms-2">4</SpkBadge>
const badgedanger = <SpkBadge variant="" Customclass="bg-danger-transparent ms-2">6</SpkBadge>
const badgeSuccess = <SpkBadge variant="" Customclass="bg-success-transparent ms-2">8</SpkBadge>

export const MENUITEMS: any = [

  {
     menutitle:'MAIN'
  },
  {
    title: "Dashboards", icon: Svgicons.Dashboardicon, type: "sub", active: false, dirchange: false, children: [

      { path: "/dashboards/sales", icon: Svgicons.Salesicon, type: "link", active: false, selected: false, dirchange: false, title: "Sales" },
      { path: "/dashboards/analytics", icon: Svgicons.Analyticsicon, type: "link", active: false, selected: false, dirchange: false, title: "Analytics" },

      {
        title: "Ecommerce", type: "sub", badgetxt:badgePrimary, icon: Svgicons.Ecommerceicon, active: false, dirchange: false, children: [

          { path: "/dashboards/ecommerce/dashboard", type: "link", active: false, selected: false, dirchange: false, title: "Dashboard" },
          { path: "/dashboards/ecommerce/products", type: "link", active: false, selected: false, dirchange: false, title: "Products" },
          { path: "/dashboards/ecommerce/product-details", type: "link", active: false, selected: false, dirchange: false, title: "Product Details" },
          { path: "/dashboards/ecommerce/cart", type: "link", active: false, selected: false, dirchange: false, title: "Cart" },
          { path: "/dashboards/ecommerce/checkout", type: "link", active: false, selected: false, dirchange: false, title: "Checkout" },
          { path: "/dashboards/ecommerce/customers", type: "link", active: false, selected: false, dirchange: false, title: "Customers" },
          { path: "/dashboards/ecommerce/orders", type: "link", active: false, selected: false, dirchange: false, title: "Orders" },
          { path: "/dashboards/ecommerce/order-details", type: "link", active: false, selected: false, dirchange: false, title: "Order Details" },
          { path: "/dashboards/ecommerce/add-product", type: "link", active: false, selected: false, dirchange: false, title: "Add Product" },

        ]
      },
      {
        title: "Crypto", type: "sub", badgetxt:badgeSucccess, icon: Svgicons.Cryptoicon, active: false, selected: false, dirchange: false, children: [

          { path: "/dashboards/crypto/dashboard", type: "link", active: false, selected: false, dirchange: false, title: "Dashboard" },
          { path: "/dashboards/crypto/transactions", type: "link", active: false, selected: false, dirchange: false, title: "Transactions" },
          { path: "/dashboards/crypto/currency-exchange", type: "link", active: false, selected: false, dirchange: false, title: "Currency Exchange" },
          { path: "/dashboards/crypto/buy-sell", type: "link", active: false, selected: false, dirchange: false, title: "Buy & Sell" },
          { path: "/dashboards/crypto/market-cap", type: "link", active: false, selected: false, dirchange: false, title: "Marketcap" },
          { path: "/dashboards/crypto/wallet", type: "link", active: false, selected: false, dirchange: false, title: "Wallet" },

        ],
      },
      {
        title: "CRM", type: "sub",  badgetxt:badgeWarning, icon: Svgicons.Crmicon, active: false, selected: false, dirchange: false, children: [

          { path: "/dashboards/crm/dashboard", type: "link", active: false, selected: false, dirchange: false, title: "Dashboard" },
          { path: "/dashboards/crm/contacts", type: "link", active: false, selected: false, dirchange: false, title: "Contacts" },
          { path: "/dashboards/crm/companies", type: "link", active: false, selected: false, dirchange: false, title: "Companies" },
          { path: "/dashboards/crm/deals", type: "link", active: false, selected: false, dirchange: false, title: "Deals" },
          { path: "/dashboards/crm/leads", type: "link", active: false, selected: false, dirchange: false, title: " Leads" },

        ],
      },
      {
        title: "Projects", type: "sub", badgetxt:badgeInfo, icon: Svgicons.Projectsicon, active: false, selected: false, dirchange: false, children: [

          { path: "/dashboards/projects/dashboard", type: "link", active: false, selected: false, dirchange: false, title: "Dashboard" },
          { path: "/dashboards/projects/projects-list", type: "link", active: false, selected: false, dirchange: false, title: "Project List" },
          { path: "/dashboards/projects/project-overview", type: "link", active: false, selected: false, dirchange: false, title: "Project Overview" },
          { path: "/dashboards/projects/create-project", type: "link", active: false, selected: false, dirchange: false, title: "Create Project" },

        ],
      },
      { path: "/dashboards/hrm", type: "link", icon: Svgicons.Hrmicon, active: false, selected: false, dirchange: false, title: "HRM" },
      { path: "/dashboards/courses", type: "link", active: false, icon:Svgicons.Courseicon, selected: false, dirchange: false, title: "Courses" },
      { path: "/dashboards/stocks", type: "link", active: false, icon:Svgicons.Stockicon, selected: false, dirchange: false, title: "Stocks" },
      {
        title: "NFT", type: "sub", badgetxt:badgedanger, active: false, icon: Svgicons.Nfticon, selected: false, dirchange: false, children: [

          { path: "/dashboards/nft/dashboard", type: "link", active: false, selected: false, dirchange: false, title: "Dashboard" },
          { path: "/dashboards/nft/market-place", type: "link", active: false, selected: false, dirchange: false, title: "Market Place" },
          { path: "/dashboards/nft/nft-details", type: "link", active: false, selected: false, dirchange: false, title: "NFT Details" },
          { path: "/dashboards/nft/create-nft", type: "link", active: false, selected: false, dirchange: false, title: "Create NFT" },
          { path: "/dashboards/nft/wallet-integration", type: "link", active: false, selected: false, dirchange: false, title: " Wallet Integration" },
          { path: "/dashboards/nft/live-auction", type: "link", active: false, selected: false, dirchange: false, title: "Live Auction" },

        ],
      },
      {
        title: "Jobs", type: "sub", badgetxt:badgeSuccess, active: false, icon: Svgicons.Jobsicon, selected: false, children: [

          { path: "/dashboards/jobs/dashboard", type: "link", active: false, selected: false, dirchange: false, title: "Dashboard" },
          { path: "/dashboards/jobs/job-details", type: "link", active: false, selected: false, dirchange: false, title: "Job Details" },
          { path: "/dashboards/jobs/search-company", type: "link", active: false, selected: false, dirchange: false, title: "Search Company" },
          { path: "/dashboards/jobs/search-jobs", type: "link", active: false, selected: false, dirchange: false, title: "Search Jobs" },
          { path: "/dashboards/jobs/job-post", type: "link", active: false, selected: false, dirchange: false, title: " Job Post" },
          { path: "/dashboards/jobs/jobs-list", type: "link", active: false, selected: false, dirchange: false, title: " Jobs List" },
          { path: "/dashboards/jobs/search-candidate", type: "link", active: false, selected: false, dirchange: false, title: " Search Candidate" },
          { path: "/dashboards/jobs/candidate-details", type: "link", active: false, selected: false, dirchange: false, title: "Candidate Details" },

        ],
      },
      { path: "/dashboards/podcast", type: "link", icon: Svgicons.Podcasticon, active: false, selected: false, dirchange: false, title: "Podcast" },
      { path: "/dashboards/social-media", type: "link", icon: Svgicons.Socialicon, active: false, selected: false, dirchange: false, title: "Social Media" },
      { path: "/dashboards/school", type: "link", icon: Svgicons.Schoolicon, active: false, selected: false, dirchange: false, title: "School" },
      { path: "/dashboards/medical", type: "link", icon: Svgicons.Medicalicon, active: false, selected: false, dirchange: false, title: "Medical" },
      { path: "/dashboards/pos-system", type: "link", icon: Svgicons.Posicon, active: false, selected: false, dirchange: false, title: "POS System" },
    ]
  },

  {
    menutitle:'WEB APPS'
 },

  {
    title: "Applications", icon: Svgicons.Applicationicon, type: "sub", active: false, selected: false, dirchange: false, children: [

      { path: "/applications/chat", icon: Svgicons.Chaticon, type: "link", active: false, selected: false, dirchange: false, title: "Chat" },
      {
        title: "Email", type: "sub", icon: Svgicons.Emailicon, active: false, children: [

          { path: "/applications/email/mail-app", type: "link", active: false, selected: false, dirchange: false, title: "Mail-App" },
          { path: "/applications/email/mail-settings", type: "link", active: false, selected: false, dirchange: false, title: "Mail-Settings" },

        ]
      },
      { path: "/applications/file-manager", icon: Svgicons.Fileicon, type: "link", active: false, selected: false, dirchange: false, title: "File Manager" },
      { path: "/applications/full-calendar", icon: Svgicons.Fullicon, type: "link", active: false, selected: false, dirchange: false, title: "Full Calendar" },
      { path: "/applications/gallery", type: "link", icon: Svgicons.Galleryicon, active: false, selected: false, dirchange: false, title: "Gallery" },
      { path: "/applications/sweet-alerts", type: "link", icon: Svgicons.Sweeticon, active: false, selected: false, dirchange: false, title: "Sweet Alerts" },
      {
        title: "Task", type: "sub", icon: Svgicons.Taskicon, active: false, selected: false, dirchange: false, doublToggle: false, children: [

          { path: "/applications/task/kanban-board", type: "link", active: false, selected: false, dirchange: false, title: "Kanban Board" },
          { path: "/applications/task/list-view", type: "link", active: false, selected: false, dirchange: false, title: "List View" },

        ]
      },
      { path: "/applications/to-do-list", icon: Svgicons.Todoicon, type: "link", active: false, selected: false, dirchange: false, title: "To Do List" },
    ],
  },

  {
    title: "Nested Menu", icon: Svgicons.Nestedmenuicon, selected: false, active: false, dirchange: false, type: "sub", children: [

      { path: "", title: "Nested-1", icon: Svgicons.Nested1icon, type: "empty", active: false, selected: false, dirchange: false},
      { title: "Nested-2", icon: Svgicons.Nested2icon, type: "sub", active: false, selected: false, dirchange: false, children: [

          { path: "", type: "empty", active: false, selected: false, dirchange: false, title: "Nested-2-1"},
          { path: "", type: "empty", ctive: false, selected: false, dirchange: false, title: "Nested-2-2"},
          { path: "", type: "empty", active: false, selected: false, dirchange: false, title: "Nested-2-3"},

        ],
      },

    ],
  },

  {
    menutitle:'PAGES'
 },

  {
    icon: Svgicons.Pagesicon, title: "Pages", type: "sub", active: false, dirchange: false, children: [
      {
        icon: Svgicons.Authenticationicon, title: " Authentication", type: "sub", active: false, selected: false, dirchange: false, children: [
          { path: "/authentication/coming-soon", type: "link", active: false, selected: false, title: "Coming Soon" },

          {
            title: "Create Password", type: "sub", active: false, selected: false, dirchange: false, children: [
              { path: "/authentication/create-password/basic", type: "link", active: false, selected: false, dirchange: false, title: "Basic" },
              { path: "/authentication/create-password/cover", type: "link", active: false, selected: false, title: "Cover" },
            ],
          },
          {
            title: "Lock Screen", type: "sub", active: false, selected: false, dirchange: false, children: [
              { path: "/authentication/lock-screen/basic", type: "link", active: false, selected: false, dirchange: false, title: "Basic" },
              { path: "/authentication/lock-screen/cover", type: "link", active: false, selected: false, title: "Cover" },
            ],
          },
          {
            title: "Reset Password", type: "sub", active: false, selected: false, dirchange: false, children: [
              { path: "/authentication/reset-password/basic", type: "link", active: false, selected: false, dirchange: false, title: "Basic" },
              { path: "/authentication/reset-password/cover", type: "link", active: false, selected: false, dirchange: false, title: "Cover" },
            ],
          },
          {
            title: "Sign Up", type: "sub", active: false, selected: false, dirchange: false, children: [
              { path: "/authentication/sign-up/basic", type: "link", active: false, selected: false, dirchange: false, title: "Basic" },
              { path: "/authentication/sign-up/cover", type: "link", active: false, selected: false, dirchange: false, title: "Cover" },
            ],
          },
          {
            title: "Sign In", type: "sub", active: false, selected: false, dirchange: false, children: [
              { path: "/authentication/sign-in/basic", type: "link", active: false, selected: false, dirchange: false, title: "Basic" },
              { path: "/authentication/sign-in/cover", type: "link", active: false, selected: false, dirchange: false, title: "Cover" },
            ],
          },
          {
            title: "Two Step Verification", type: "sub", active: false, selected: false, dirchange: false, children: [
              { path: "/authentication/two-step-verification/basic", type: "link", active: false, selected: false, dirchange: false, title: "Basic" },
              { path: "/authentication/two-step-verification/cover", type: "link", active: false, selected: false, dirchange: false, title: "Cover" },
            ],
          },
          { path: "/authentication/under-maintainance", type: "link", active: false, selected: false, dirchange: false, title: "Under Maintainance" },
        ]
      },
      {
        icon: Svgicons.Erroricon, title: "Error", type: "sub", active: false, selected: false, dirchange: false, children: [

          { path: "/authentication/error/401-error", type: "link", active: false, selected: false, dirchange: false, title: "401-Error" },
          { path: "/authentication/error/404-error", type: "link", active: false, selected: false, dirchange: false, title: "404-Error" },
          { path: "/authentication/error/500-error", type: "link", active: false, selected: false, dirchange: false, title: "500-Error" },
        ]
      },
      {
        title: "Blog", icon: Svgicons.Blogicon, type: "sub", active: false, dirchange: false, children: [
          { path: "/pages/blog/blog", type: "link", active: false, selected: false, dirchange: false, title: "Blog" },
          { path: "/pages/blog/blog-details", type: "link", active: false, selected: false, dirchange: false, title: "Blog-Details" },
          { path: "/pages/blog/create-blog", type: "link", active: false, selected: false, dirchange: false, title: "Create-Blog" },
        ]
      },
      { path: "/pages/empty", icon: Svgicons.Emptyicon, type: "link", active: false, selected: false, dirchange: false, title: "Empty", },
      {
        title: "Forms", icon: Svgicons.Formsicon, type: "sub", active: false, selected: false, dirchange: false, children: [

          { path: "/pages/forms/form-advanced", type: "link", active: false, selected: false, dirchange: false, title: "Form Advanced" },

          {
            title: "Form Elements", type: "sub", menusub: true, active: false, selected: false, dirchange: false, children: [
              { path: "/pages/forms/form-elements/inputs", type: "link", active: false, selected: false, dirchange: false, title: "Inputs" },
              { path: "/pages/forms/form-elements/checks-radios", type: "link", active: false, selected: false, dirchange: false, title: "Checks & Radios " },
              { path: "/pages/forms/form-elements/input-group", type: "link", active: false, selected: false, dirchange: false, title: "Input Group" },
              { path: "/pages/forms/form-elements/form-select", type: "link", active: false, selected: false, dirchange: false, title: "Form Select" },
              { path: "/pages/forms/form-elements/range-slider", type: "link", active: false, selected: false, dirchange: false, title: "Range Slider" },
              { path: "/pages/forms/form-elements/input-masks", type: "link", active: false, selected: false, dirchange: false, title: "Input Masks" },
              { path: "/pages/forms/form-elements/file-uploads", type: "link", active: false, selected: false, dirchange: false, title: "File Uploads" },
              { path: "/pages/forms/form-elements/date-time-picker", type: "link", active: false, selected: false, dirchange: false, title: "Date,Time Picker" },
              { path: "/pages/forms/form-elements/color-picker", type: "link", active: false, selected: false, dirchange: false, title: "Color Pickers" },

            ],
          },
          { path: "/pages/forms/floating-labels", type: "link", active: false, selected: false, dirchange: false, title: "Floating Labels" },
          { path: "/pages/forms/form-layouts", type: "link", active: false, selected: false, dirchange: false, title: "Form Layouts" },
          { path: "/pages/forms/form-wizards", type: "link", active: false, selected: false, dirchange: false, title: "Form Wizards" },
          { path: "/pages/forms/sun-editor", type: "link", active: false, selected: false, dirchange: false, title: "Sun Editor" },
          { path: "/pages/forms/validation", type: "link", active: false, selected: false, dirchange: false, title: "Validation" },
          { path: "/pages/forms/select2", type: "link", active: false, selected: false, dirchange: false, title: "Select2" },
        ],
      },
      { path: "/pages/faqs", icon: Svgicons.Faqsicon, type: "link", active: false, selected: false, dirchange: false, title: "FAQ's" },
      {
        title: "Invoice", type: "sub", icon: Svgicons.Invoiceicon, menusub: true, active: false, selected: false, dirchange: false, children: [
          { path: "/pages/invoice/create-invoice", type: "link", active: false, selected: false, dirchange: false, title: "Create Invoice" },
          { path: "/pages/invoice/invoice-details", type: "link", active: false, selected: false, dirchange: false, title: "Invoice Details" },
          { path: "/pages/invoice/invoice-list", type: "link", active: false, selected: false, dirchange: false, title: "Invoice List" },
        ],
      },
      { path: "/landing", icon: Svgicons.Landingicon, type: "link", active: false, selected: false, dirchange: false, title: "Landing" },
      { path: "/pages/pricing", icon: Svgicons.Pricingicon, type: "link", active: false, selected: false, dirchange: false, title: "Pricing" },
      { path: "/pages/profile", type: "link", icon: Svgicons.Profileicon, active: false, selected: false, dirchange: false, title: "Profile" },
      { path: "/pages/profile-settings", type: "link", icon: Svgicons.Profilesettingicon, active: false, selected: false, dirchange: false, title: "Profile Settings" },
      { path: "/pages/testimonials", type: "link", icon: Svgicons.Testimonialicon, active: false, selected: false, dirchange: false, title: "Testimonials" },
      { path: "/pages/search", type: "link", icon: Svgicons.Searchicon, active: false, selected: false, dirchange: false, title: "Search" },
      { path: "/pages/team", type: "link", icon: Svgicons.Teamicon, active: false, selected: false, dirchange: false, title: "Team", },
      { path: "/pages/terms-conditions", type: "link", icon: Svgicons.Termsicon, active: false, selected: false, dirchange: false, title: "Terms & Conditions" },
      { path: "/pages/timeline", type: "link", icon: Svgicons.Timelineicon, active: false, selected: false, dirchange: false, title: "Timeline" },
    ]
  },

  {
    menutitle:'GENERAL'
 },

  {
    title: "General", icon: Svgicons.Generalicon, type: "sub", active: false, selected: false, dirchange: false, children: [
      {
        title: "Ui Elements", icon: Svgicons.Elementsicon, type: "sub", active: false, selected: false, dirchange: false, children: [
          { path: "/general/ui-elements/alerts", type: "link", active: false, selected: false, dirchange: false, title: "Alerts" },
          { path: "/general/ui-elements/badge", type: "link", active: false, selected: false, dirchange: false, title: "Badge" },
          { path: "/general/ui-elements/breadcrumb", type: "link", active: false, selected: false, dirchange: false, title: "Breadcrumb" },
          { path: "/general/ui-elements/buttons", type: "link", active: false, selected: false, dirchange: false, title: "Buttons" },
          { path: "/general/ui-elements/button-group", type: "link", active: false, selected: false, dirchange: false, title: "Button Group" },
          { path: "/general/ui-elements/cards", type: "link", active: false, selected: false, dirchange: false, title: "Cards" },
          { path: "/general/ui-elements/dropdowns", type: "link", active: false, selected: false, dirchange: false, title: "Dropdowns" },
          { path: "/general/ui-elements/images-figures", type: "link", active: false, selected: false, dirchange: false, title: "Images & Figures" },
          { path: "/general/ui-elements/links-interactions", type: "link", active: false, selected: false, dirchange: false, title: "Links & Interactions" },
          { path: "/general/ui-elements/list-group", type: "link", active: false, selected: false, dirchange: false, title: "List Group" },
          { path: "/general/ui-elements/navs-tabs", type: "link", active: false, selected: false, dirchange: false, title: "Navs & Tabs" },
          { path: "/general/ui-elements/object-fit", type: "link", active: false, selected: false, dirchange: false, title: "Object Fit" },
          { path: "/general/ui-elements/pagination", type: "link", active: false, selected: false, dirchange: false, title: "Pagination" },
          { path: "/general/ui-elements/popovers", type: "link", active: false, selected: false, dirchange: false, title: "Popovers" },
          { path: "/general/ui-elements/progress", type: "link", active: false, selected: false, dirchange: false, title: "Progress" },
          { path: "/general/ui-elements/spinners", type: "link", active: false, selected: false, dirchange: false, title: "Spinners" },
          { path: "/general/ui-elements/toasts", type: "link", active: false, selected: false, dirchange: false, title: "Toasts" },
          { path: "/general/ui-elements/tooltips", type: "link", active: false, selected: false, dirchange: false, title: "Tooltips" },
          { path: "/general/ui-elements/typography", type: "link", active: false, selected: false, dirchange: false, title: "Typography" },
        ],
      },
      {
        title: "Utilities", icon: Svgicons.Utilitiesicon, type: "sub", active: false, selected: false, dirchange: false, children: [
          { path: "/general/utilities/avatars", type: "link", active: false, selected: false, dirchange: false, title: "Avatars" },
          { path: "/general/utilities/borders", type: "link", active: false, selected: false, dirchange: false, title: "Borders" },
          { path: "/general/utilities/breakpoints", type: "link", active: false, selected: false, dirchange: false, title: "Breakpoints" },
          { path: "/general/utilities/colors", type: "link", active: false, selected: false, dirchange: false, title: "Colors" },
          { path: "/general/utilities/columns", type: "link", active: false, selected: false, dirchange: false, title: "Columns" },
          { path: "/general/utilities/css-grid", type: "link", active: false, selected: false, dirchange: false, title: "Css Grid" },
          { path: "/general/utilities/flex", type: "link", active: false, selected: false, dirchange: false, title: "Flex" },
          { path: "/general/utilities/gutters", type: "link", active: false, selected: false, dirchange: false, title: "Gutters" },
          { path: "/general/utilities/helpers", type: "link", active: false, selected: false, dirchange: false, title: "Helpers" },
          { path: "/general/utilities/position", type: "link", active: false, selected: false, dirchange: false, title: "Position" },
          { path: "/general/utilities/additional-content", type: "link", active: false, selected: false, dirchange: false, title: "Additional Content" },

        ],
      },
      {
        title: "Advanced Ui", icon: Svgicons.Advancedicon, type: "sub", active: false, selected: false, dirchange: false, children: [
          { path: "/general/advanced-ui/accordions-collapse", type: "link", active: false, selected: false, dirchange: false, title: "Accordions & collapse" },
          { path: "/general/advanced-ui/carousel", type: "link", active: false, selected: false, dirchange: false, title: "Carousel" },
          { path: "/general/advanced-ui/draggable-cards", type: "link", active: false, selected: false, dirchange: false, title: "Draggable Cards" },
          { path: "/general/advanced-ui/media-player", type: "link", active: false, selected: false, dirchange: false, title: "Media Player" },
          { path: "/general/advanced-ui/modals-closes", type: "link", active: false, selected: false, dirchange: false, title: "Modals & Closes" },
          { path: "/general/advanced-ui/navbar", type: "link", active: false, selected: false, dirchange: false, title: "Navbar" },
          { path: "/general/advanced-ui/offcanvas", type: "link", active: false, selected: false, dirchange: false, title: "Offcanvas" },
          { path: "/general/advanced-ui/placeholders", type: "link", active: false, selected: false, dirchange: false, title: "Placeholders" },
          { path: "/general/advanced-ui/ratings", type: "link", active: false, selected: false, dirchange: false, title: "Ratings" },
          { path: "/general/advanced-ui/ribbons", type: "link", active: false, selected: false, dirchange: false, title: "Ribbons" },
          { path: "/general/advanced-ui/sortable-js", type: "link", active: false, selected: false, dirchange: false, title: "Sortable Js" },
          { path: "/general/advanced-ui/swiper-js", type: "link", active: false, selected: false, dirchange: false, title: "Swiper JS" },
          { path: "/general/advanced-ui/tour", type: "link", active: false, selected: false, dirchange: false, title: "Tour" },
        ],
      },
    ]
  },

  { path: "/widgets", icon:Svgicons.widgetsicon, title: "widgets", type: "link", active: false, dirchange: false, selected: false },

  {
    menutitle:'MAPS & ICONS'
 },

  {
    title: "Maps", icon: Svgicons.Mapsicon, type: "sub", background: "hor-rightangle", active: false, selected: false, dirchange: false, children: [

      { path: "/maps/pigeon-maps", icon: Svgicons.Vectoricon, type: "link", active: false, selected: false, dirchange: false, title: "Pigeon Maps" },
      { path: "/maps/leaflet-maps", icon: Svgicons.Leafleticon, type: "link", active: false, selected: false, dirchange: false, title: "Leaflet Maps" }

    ],
  },

  { path: "/icons", icon: Svgicons.Iconsicon, type: "link", active: false, selected: false, dirchange: false, title: "Icons" },

  {
    menutitle:'TABLES & CHARTS'
 },

  {
    title: "Charts", icon: Svgicons.Chartsicon, type: "sub", dirchange: false, children: [
      {
        title: "Apex Charts", icon: Svgicons.Apexicon, type: "sub", menusub: true, active: false, selected: false, dirchange: false, children: [

          { path: "/charts/apex-charts/line-chart", type: "link", active: false, selected: false, dirchange: false, title: "Line Charts" },
          { path: "/charts/apex-charts/area-chart", type: "link", active: false, selected: false, dirchange: false, title: "Area Charts " },
          { path: "/charts/apex-charts/column-chart", type: "link", active: false, selected: false, dirchange: false, title: "Column Charts" },
          { path: "/charts/apex-charts/bar-chart", type: "link", active: false, selected: false, dirchange: false, title: "Bar Charts" },
          { path: "/charts/apex-charts/mixed-chart", type: "link", active: false, selected: false, dirchange: false, title: "Mixed Charts" },
          { path: "/charts/apex-charts/range-area-chart", type: "link", active: false, selected: false, dirchange: false, title: "Range Area Charts" },
          { path: "/charts/apex-charts/timeline-chart", type: "link", active: false, selected: false, dirchange: false, title: "Timeline Charts" },
          { path: "/charts/apex-charts/funnel-chart", type: "link", active: false, selected: false, dirchange: false, title: "Funnel Charts" },
          { path: "/charts/apex-charts/candlestick-chart", type: "link", active: false, selected: false, dirchange: false, title: "CandleStick Charts" },
          { path: "/charts/apex-charts/boxplot-chart", type: "link", active: false, selected: false, dirchange: false, title: "Boxplot Charts" },
          { path: "/charts/apex-charts/bubble-chart", type: "link", active: false, selected: false, dirchange: false, title: "Bubble Charts" },
          { path: "/charts/apex-charts/scatter-chart", type: "link", active: false, selected: false, dirchange: false, title: "Scatter Charts" },
          { path: "/charts/apex-charts/heatmap-chart", type: "link", active: false, selected: false, dirchange: false, title: "Heatmap Charts" },
          { path: "/charts/apex-charts/treemap-chart", type: "link", active: false, selected: false, dirchange: false, title: "Treemap Charts" },
          { path: "/charts/apex-charts/pie-chart", type: "link", active: false, selected: false, dirchange: false, title: "Pie Charts" },
          { path: "/charts/apex-charts/radialbar-chart", type: "link", active: false, selected: false, dirchange: false, title: "Radialbar Charts" },
          { path: "/charts/apex-charts/radar-chart", type: "link", active: false, selected: false, dirchange: false, title: "Radar Charts" },
          { path: "/charts/apex-charts/polararea-chart", type: "link", active: false, selected: false, dirchange: false, title: "Polararea Charts" },
        ],
      },
      { path: "/charts/chartjs-charts", icon: Svgicons.Chartjsicon, type: "link", active: false, selected: false, dirchange: false, title: "Chartjs Charts" },
      { path: "/charts/echart-charts", type: "link", icon: Svgicons.Echartsicon, active: false, selected: false, dirchange: false, title: "Echart Charts" },
    ],
  },

  {
    title: "Tables", icon:Svgicons.Tablesicon, type: "sub", menutitle: "", active: false, selected: false, dirchange: false, children: [

      { path: "/tables/tables", type: "link", icon:Svgicons.Basictableicon, active: false, selected: false, dirchange: false, title: "Tables" },
      { path: "/tables/grid-js-tables", type: "link", icon:Svgicons.Gridjsicon, active: false, selected: false, dirchange: false, title: "Grid JS Tables" },
      { path: "/tables/data-tables", type: "link", icon:Svgicons.Datatablesicon, active: false, selected: false, dirchange: false, title: "Data Tables" },
      
    ],
  },
]