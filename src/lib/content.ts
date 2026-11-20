/** All site copy lives here. Later this can be swapped for DB / CMS queries without touching components. */
export const SITE = {
  name: "ARCH-AID",
  tagline: "Architecture & Interior Design",
  contact: {
    phone: "+91-9820900246",
    email: "archaid96@gmail.com",
    whatsapp: "",
    office: "Shop No.8 Prafullaban CHSL, Next to Kamgar Sena Office, Ram Maruti Road, Dadar West, Mumbai 400028",
    social: [] as { name: string; url: string }[],
    /** Google Maps listing for the studio. `url` opens the place page; `embed` drives the map on the Contact page; `directions` starts navigation. */
    map: {
      url: "https://maps.app.goo.gl/ZXq9vWn2a6X5dEZ56",
      embed: "https://www.google.com/maps?q=19.0228748,72.8403874&z=17&output=embed",
      directions: "https://www.google.com/maps/dir/?api=1&destination=19.0228748,72.8403874",
    },
  },
};

/** Filter tabs of the Selected Work section. A project's `cat` must be one of these (except "All Project"). */
export const PROJECT_CATEGORIES = ["Residence", "Corporate", "Hospitality", "Showrooms", "Special Interior", "Office Interior"] as const;
export const ALL_CATEGORY = "All Project";
export type Project = { slug: string; name: string; cat: string; loc?: string; img: string; gallery?: string[] };
/** Gallery images live in /public/images/gallery/<slug>/01.webp … NN.webp */
const gallery = (slug: string, n: number) => Array.from({ length: n }, (_, i) => `/images/gallery/${slug}/${String(i + 1).padStart(2, "0")}.webp`);
export const PROJECTS: Project[] = [
  { slug: "hiren-ashar-residence", name: "Hiren Ashar Residence", cat: "Residence", img: "hiren", gallery: gallery("hiren-ashar-residence", 12) },
  { slug: "shekar-shetty-villa", name: "Shekar Shetty’s Villa", cat: "Residence", img: "/images/gallery/shekar-shetty-villa/01.webp", gallery: gallery("shekar-shetty-villa", 11) },
  { slug: "mansi-toprani-residence", name: "Mansi Toprani’s Residence", cat: "Residence", img: "/images/gallery/mansi-toprani-residence/01.webp", gallery: gallery("mansi-toprani-residence", 11) },
  { slug: "babita-lulla-residence", name: "Babita Lulla’s Residence", cat: "Residence", img: "/images/gallery/babita-lulla-residence/01.webp", gallery: gallery("babita-lulla-residence", 6) },
  { slug: "vimawala-residence", name: "Vimawala Residence", cat: "Residence", img: "/images/gallery/vimawala-residence/01.webp", gallery: gallery("vimawala-residence", 7) },
  { slug: "sujata-mehta-residence", name: "Sujata Mehta Residence", cat: "Residence", img: "sujata", gallery: gallery("sujata-mehta-residence", 6) },
  { slug: "suri-residence", name: "Suri Residence", cat: "Residence", img: "/images/gallery/suri-residence/01.webp", gallery: gallery("suri-residence", 7) },
  { slug: "abhinav-bank-head-office", name: "Abhinav Bank Head office", cat: "Corporate", img: "/images/gallery/abhinav-bank-head-office/01.webp", gallery: gallery("abhinav-bank-head-office", 7) },
  { slug: "shri-parasnath-exports", name: "Shri Parasnath Exports", cat: "Corporate", img: "/images/gallery/shri-parasnath-exports/01.webp", gallery: gallery("shri-parasnath-exports", 14) },
  { slug: "abhinav-sahakari-bank", name: "Abhinav Sahakari Bank", cat: "Corporate", img: "/images/gallery/abhinav-sahakari-bank/01.webp", gallery: gallery("abhinav-sahakari-bank", 4) },
  { slug: "aura-restobar", name: "Aura Restobar", cat: "Hospitality", img: "/images/gallery/aura-restobar/01.webp", gallery: gallery("aura-restobar", 7) },
  { slug: "bbc-restobar", name: "BBC Restobar", cat: "Hospitality", img: "/images/gallery/bbc-restobar/01.webp", gallery: gallery("bbc-restobar", 7) },
  { slug: "rd-lounge", name: "RD Lounge", cat: "Hospitality", img: "/images/gallery/rd-lounge/01.webp", gallery: gallery("rd-lounge", 7) },
  { slug: "goa-portuguesa", name: "Goa Portuguesa", cat: "Hospitality", img: "/images/gallery/goa-portuguesa/01.webp", gallery: gallery("goa-portuguesa", 9) },
  { slug: "dakshin-culture-curry", name: "Dakshin Culture Curry", cat: "Hospitality", img: "/images/gallery/dakshin-culture-curry/01.webp", gallery: gallery("dakshin-culture-curry", 6) },
  { slug: "bollywood-mischief", name: "Bollywood Mischief", cat: "Showrooms", img: "/images/gallery/bollywood-mischief/01.webp", gallery: gallery("bollywood-mischief", 11) },
  { slug: "enar-cards-showroom", name: "Enar Cards Showroom", cat: "Showrooms", img: "/images/gallery/enar-cards-showroom/01.webp", gallery: gallery("enar-cards-showroom", 5) },
  { slug: "hue-boutique", name: "Hue Boutique", cat: "Showrooms", img: "/images/gallery/hue-boutique/01.webp", gallery: gallery("hue-boutique", 5) },
  { slug: "rr-boutique-hotel", name: "RR Boutique Hotel", cat: "Special Interior", img: "/images/gallery/rr-boutique-hotel/01.webp", gallery: gallery("rr-boutique-hotel", 10) },
  { slug: "lodha-dham", name: "Lodha Dham", cat: "Special Interior", img: "/images/gallery/lodha-dham/01.webp", gallery: gallery("lodha-dham", 12) },
  { slug: "merino-experience-centre", name: "Merino Experience Centre", cat: "Special Interior", img: "/images/gallery/merino-experience-centre/01.webp", gallery: gallery("merino-experience-centre", 9) },
  { slug: "nitrro-bespoke-fitness-pune", name: "Nitrro Bespoke Fitness (Pune)", cat: "Special Interior", img: "/images/gallery/nitrro-bespoke-fitness-pune/01.webp", gallery: gallery("nitrro-bespoke-fitness-pune", 13) },
  { slug: "neilesh-bhavya-residence", name: "Neilesh & Bhavya Residence", cat: "Residence", img: "neilesh" },
  { slug: "kanwar-residency", name: "Kanwar Residency", cat: "Residence", img: "kanwar" },
  { slug: "pramod-patil-residency", name: "Pramod Patil Residency", cat: "Residence", img: "pramod" },
];

/** Services page copy, as supplied by the client (only stray capitals/punctuation tidied; no wording changed). */
export const SERVICES = {
  intro: "ARCH-AID is a design firm primarily in architecture and interior designing. We offer services like",
  list: [
    "Architectural Project designing and execution",
    "Approval for Various Authorities",
    "Working Details and PMC",
    "Interior Designing and Space Planning",
    "Interior Projects Execution and Turn Key",
    "Landscape Planning",
    "3 D Views",
    "Working out a Theme for Project",
    "Theme based design for Brochures and Stationary",
    "Accessories and Artefacts",
  ],
  sections: [
    { title: "Architectural Services", img: "/images/gallery/lodha-dham/03.webp", alt: "Architecture by ARCH-AID",
      text: "We offer designing, supervision and execution for various type of architectural projects ranging from residential villas and apartments, hotels, resorts, hospitals, educational institutes, spiritual places etc. We specialise in designer projects along with approval dwgs, working details and PMC for projects." },
    { title: "Interior Design Services", img: "/images/gallery/hiren-ashar-residence/01.webp", alt: "Interior design by ARCH-AID",
      text: "We offer one stop solution for all interior design projects ranging from high end residences, small houses, hospitality projects, educational and institutional projects, hospitals, spiritual centres, SPA and gymnasiums and office projects. We undertake turn key projects and specialise in working out theme based interiors. We specialise in lighting and it adds whole new dimension to the design." },
    { title: "Landscape Design Services", img: "/images/gallery/lodha-dham/04.webp", alt: "Landscape design by ARCH-AID",
      text: "We offer landscape designs for all architectural landscapes and interior small landscape areas like balcony and terraces. We believe in creating landscapes those are sensory and calming. Extensive use of water bodies along with accessories and artefacts with ambient lighting to create exotic look and feel to the whole place. We specialise in lighting and it adds whole new dimension to the design." },
  ],
};

export const PILLARS = [
  ["Experience", "Decades of professional experience across architecture and interior design.", "sujata"],
  ["Design Thinking", "Solutions developed around the people, purpose and possibilities of each space.", "neilesh"],
  ["Technical Expertise", "Detailed planning, drawings and specifications that help translate ideas into reality.", "banner"],
  ["Execution Involvement", "Practical involvement in supervision, coordination and execution, according to the agreed project scope.", "sayo"],
] as const;

export const STAGES = [
  ["Understanding Your Vision", "Understanding requirements, preferences, site conditions and project objectives.", "kanwar"],
  ["Concept & Design", "Translating ideas into concepts, layouts and visual presentations.", "neilesh"],
  ["Detailed Planning", "Developing drawings, specifications, materials and design details.", "hiren"],
  ["Execution & Coordination", "Supporting project execution, site supervision and coordination according to the agreed scope.", "sayo"],
  ["The Finished Space", "Bringing the design together through considered details and practical execution.", "birdsong"],
] as const;

export const TEAM = [
  { n: "Neilesh Kenkare", photo: "/images/neilesh.jpg",
    bio: [
      "Neilesh Kenkare is an Architect graduated from Sir J.J. college of Architecture who Heads the firm. Having over 28 years of experience in the profession, Neilesh also has good experience in Hospitality and Health clubs planning and has worked and designed various Restaurants, Bars, Gyms and Resorts. Neilesh has expertise in time and money management related to the project and budgeting along with the execution on site.",
      "Neilesh has taught in L.S.Raheja School of Interior Designing, Garodia School, Sir J.J. College of Architecture and NMIMS school of Architecture and also taught in the Department of Design and Interior Design at Rachana Sansad’s Academy of Architecture at Prabhadevi.",
    ] },
  { n: "Bhavya Kenkare", photo: "/images/bhavya.png",
    bio: [
      "A graduate of Sir JJ College of Architecture, is a qualified architect and interior designer practicing in Mumbai, Ar. Bhavya Kenkare is a partner with husband Ar. Neilesh Kenkare at their firm, Arch-Aid, in addition to running her own full-fledged independent practice. Her practice of over 24 years covers architectural as well as interior design solutions. She has been part of the jury panels for several design competitions and teaches Interior Design at LS Raheja College of Architecture and Rachana Sansad’s Academy of Architecture, Mumbai. High end residential and hospitality designs have been her forte, as she specializes in fine detailing and impressive presentations that she finishes personally, and nurtures an innate knack for curating and matching art and accessories. Bhavya Kenkare’s work can be seen featured in many publications and has also been awarded recognitions on several occasions.",
    ] },
];

export const STATS = [["52+", "Combined years of practice"], ["3", "Disciplines under one roof"], ["1", "Team from concept to site"]] as const;
export const PROJECT_TYPES = ["Residential", "Hospitality", "Corporate & Commercial", "Retail & Showrooms", "Specialised Interiors", "Architecture", "Landscape"] as const;
export const NAV = [["Home", "/"], ["About", "/about"], ["Services", "/services"], ["Projects", "/projects"], ["Process", "/process"], ["Celebrity Clients", "/celebrity-clients"], ["Contact", "/contact"]] as const;
export const img = (k: string) => (k.startsWith("/") ? k : `/images/${k}.webp`);

/** Home page showcase: up to two albums from each category, so it stays light and mixed. */
export const FEATURED: Project[] = PROJECT_CATEGORIES.flatMap((c) => PROJECTS.filter((p) => p.cat === c).slice(0, 2));

/** About page copy, exactly as supplied by the client (only stray capitals/punctuation tidied; no wording changed). */
export const ABOUT = {
  paragraphs: [
    "We are a Multi-Service Design firm offering solutions for various Architectural, Interior as well as Landscape Projects ranging from residential, commercial, hospitality, educational and also religious spaces. Ours is a totally computerized firm. We also specialize in Presentation Works using tools like perspectives and Walk-throughs giving a fair picture to the clients of the proposal given. We also offer assistance other than Designing in Concept workings, Estimations, Specifications along with Execution and supervision till completion and final certification of the design.",
    "You like it or may not like it as liking is relative, but one thing is for sure that you can not ignore our work, as its powerful and dynamic and most important its done with lot of conviction.",
    "Working on site is what we believe in minimizing errors and not breaking anything after it is designed, as we try and make all the details physically at the site.",
    "Architecture is nothing but passion and lot of hard work and we as Architects see the process of generation of the entire site with its stages and involvement is fullest giving clients value for their money and trust.",
  ],
  lead: "Like we always say…",
  motto: "“OUR CLIENTS ARE “NOW” OUR FRIENDS!”",
  achievements: [
    "Won the society interiors 2018 Creative Excellence in Architecture And Interior Designing.",
    "Jury Panel for Durian Society Interiors Awards.",
    "Grand Stand Jury for ACE TECH Durian Society Interiors Awards.",
    "Jury for Design Wall at Ace Tech",
    "Neilesh Kenkare was awarded Outstanding Contribution in field of Education",
    "Neilesh Kenkare won Award for Commercial Spaces in ACE TECH",
    "Neilesh Kenkare won Award for Runner Up Position for Alfa Awards",
    "Neilesh Kenkare is Interviewed on CNBC and Doordarshan",
    "Bhavya Kenkare won the 2014 TOP 50 Interior Designers award for iGEN.",
    "Won the 2015 Top 100 Hot Architects of the country-iGEN.",
    "Bhavya Kenkare won the award for Top Designers of inside Outside for designing small Interior Spaces.",
    "On various jury and competition panels for design in Architecture and Interior Design, including ACETECH Grand Stand itself last year.",
    "Award for All India Competition for Sahara India and K.D.M.C.",
    "Jury for the Designer of the Year Award for Society Interiors.",
    "Awarded for the design of Buddha Vihar at Nagpur.",
    "Mentors for Merino India Competition.",
    "Winner of Women Achiever Award by WADe Asia",
    "Won the Award for Upcoming Meditation Center at Yavatmal",
  ],
};

/** Celebrity Clients page: names and descriptions exactly as supplied by the client, in their order. */
export const CLIENTS = [
  ["Mr. Salman Khan", "Film Actor", "/images/celebs/salman-khan.webp"],
  ["Mr. Sohail Khan", "Director and Actor", "/images/celebs/sohail-khan.webp"],
  ["Mr. Suniel Shetty", "Film Actor", "/images/celebs/suniel-shetty.webp"],
  ["Mr. Mangalprabhat Lodha", "M.L.A. - BJP", "/images/celebs/mangalprabhat-lodha.webp"],
  ["Mr. Gurdas Mann", "Singer and Actor", "/images/celebs/gurdas-mann.webp"],
  ["Ms. Megha Dhade", "Big Boss Winner", "/images/celebs/megha-dhade.webp"],
  ["Ms. Sujata Mehta", "Film Actress", "/images/celebs/sujata-mehta.webp"],
  ["Mr. Arjun Khotkar", "PDM Minister Maharashtra", "/images/celebs/arjun-khotkar.webp"],
  ["Mr. Vasant Davkhare", "M.L.C. - NCP", "/images/celebs/vasant-davkhare.webp"],
  ["Mr. Nitesh Rane", "M.L.A.", "/images/celebs/nitesh-rane.webp"],
  ["Mr. Ramesh Patil", "M.L.A. - Manse", "/images/celebs/ramesh-patil.webp"],
  ["Mr. Raju Patil", "M.L.A. - Manse", "/images/celebs/raju-patil.webp"],
  ["Mr. Sainath Pawar", "M.L.A. - Shivsena", "/images/celebs/sainath-pawar.webp"],
  ["Ms. Shraddha Jadhav", "Mayor of Mumbai", "/images/celebs/shraddha-jadhav.webp"],
  ["Mr. R. N. Singh", "M.L.C. - BJP", "/images/celebs/r-n-singh.webp"],
  ["Mr. Pravin Darekar", "M.L.A. - Manse", "/images/celebs/pravin-darekar.webp"],
  ["Virat Kohli", "Indian Cricketer", "/images/celebs/virat-kohli.webp"],
  ["Sameer Bhujbal", "N.C.P. Leader", "/images/celebs/sameer-bhujbal.webp"],
] as const;
