/**
 * Interactive Periodic Table of 118 Elements
 * Complete offline chemical database, IUPAC grid, and thermodynamic state simulator
 */

document.addEventListener('DOMContentLoaded', () => {
  // 118 Elements Dataset
  const ELEMENTS = [
    { num: 1, sym: 'H', name: 'Hydrogen', mass: '1.008', group: 1, period: 1, cat: 'reactive-nonmetal', catName: 'Reactive Nonmetal', block: 's', stateRoom: 'Gas', meltK: 14.01, boilK: 20.28, electron: '1s¹', density: '0.00008988 g/cm³', electro: 2.20, year: '1766 (Cavendish)', summary: 'Most abundant chemical substance in the Universe. Powers stellar nuclear fusion and clean fuel cells.' },
    { num: 2, sym: 'He', name: 'Helium', mass: '4.0026', group: 18, period: 1, cat: 'noble-gas', catName: 'Noble Gas', block: 's', stateRoom: 'Gas', meltK: 0.95, boilK: 4.22, electron: '1s²', density: '0.0001785 g/cm³', electro: null, year: '1868 (Janssen)', summary: 'Second-lightest and second most abundant element. Crucial for cryogenics, MRI cooling, and balloons.' },
    { num: 3, sym: 'Li', name: 'Lithium', mass: '6.94', group: 1, period: 2, cat: 'alkali-metal', catName: 'Alkali Metal', block: 's', stateRoom: 'Solid', meltK: 453.69, boilK: 1603, electron: '[He] 2s¹', density: '0.534 g/cm³', electro: 0.98, year: '1817 (Arfwedson)', summary: 'Lightest metal and least dense solid element. Essential for modern rechargeable lithium-ion batteries.' },
    { num: 4, sym: 'Be', name: 'Beryllium', mass: '9.0122', group: 2, period: 2, cat: 'alkaline-earth', catName: 'Alkaline Earth', block: 's', stateRoom: 'Solid', meltK: 1560, boilK: 2742, electron: '[He] 2s²', density: '1.85 g/cm³', electro: 1.57, year: '1798 (Vauquelin)', summary: 'Relatively rare, lightweight divalent metal used in aerospace alloys and mirrors for the James Webb Space Telescope.' },
    { num: 5, sym: 'B', name: 'Boron', mass: '10.81', group: 13, period: 2, cat: 'metalloid', catName: 'Metalloid', block: 'p', stateRoom: 'Solid', meltK: 2349, boilK: 4200, electron: '[He] 2s² 2p¹', density: '2.34 g/cm³', electro: 2.04, year: '1808 (Davy/Gay-Lussac)', summary: 'Low-abundance metalloid used in borosilicate glassware (Pyrex), fiberglass insulation, and semiconductors.' },
    { num: 6, sym: 'C', name: 'Carbon', mass: '12.011', group: 14, period: 2, cat: 'reactive-nonmetal', catName: 'Reactive Nonmetal', block: 'p', stateRoom: 'Solid', meltK: 3823, boilK: 4098, electron: '[He] 2s² 2p²', density: '2.267 g/cm³', electro: 2.55, year: 'Ancient', summary: 'The chemical basis of all known organic life. Forms allotropes including diamond, graphite, and graphene.' },
    { num: 7, sym: 'N', name: 'Nitrogen', mass: '14.007', group: 15, period: 2, cat: 'reactive-nonmetal', catName: 'Reactive Nonmetal', block: 'p', stateRoom: 'Gas', meltK: 63.15, boilK: 77.36, electron: '[He] 2s² 2p³', density: '0.0012506 g/cm³', electro: 3.04, year: '1772 (Rutherford)', summary: 'Makes up 78% of Earth\'s atmosphere. Found in all living organisms in amino acids and nucleic acids.' },
    { num: 8, sym: 'O', name: 'Oxygen', mass: '15.999', group: 16, period: 2, cat: 'reactive-nonmetal', catName: 'Reactive Nonmetal', block: 'p', stateRoom: 'Gas', meltK: 54.36, boilK: 90.20, electron: '[He] 2s² 2p⁴', density: '0.001429 g/cm³', electro: 3.44, year: '1774 (Priestley)', summary: 'Highly reactive nonmetal and oxidizing agent. Vital for aerobic respiration and combustion.' },
    { num: 9, sym: 'F', name: 'Fluorine', mass: '18.998', group: 17, period: 2, cat: 'halogen', catName: 'Halogen', block: 'p', stateRoom: 'Gas', meltK: 53.53, boilK: 85.03, electron: '[He] 2s² 2p⁵', density: '0.001696 g/cm³', electro: 3.98, year: '1886 (Moissan)', summary: 'The most electronegative and chemically reactive of all chemical elements. Used in PTFE (Teflon) and dental care.' },
    { num: 10, sym: 'Ne', name: 'Neon', mass: '20.180', group: 18, period: 2, cat: 'noble-gas', catName: 'Noble Gas', block: 'p', stateRoom: 'Gas', meltK: 24.56, boilK: 27.07, electron: '[He] 2s² 2p⁶', density: '0.0009002 g/cm³', electro: null, year: '1898 (Ramsay)', summary: 'Colorless, odorless noble gas that glows a distinct reddish-orange in high-voltage electrical discharge tubes.' },

    { num: 11, sym: 'Na', name: 'Sodium', mass: '22.990', group: 1, period: 3, cat: 'alkali-metal', catName: 'Alkali Metal', block: 's', stateRoom: 'Solid', meltK: 370.87, boilK: 1156, electron: '[Ne] 3s¹', density: '0.968 g/cm³', electro: 0.93, year: '1807 (Davy)', summary: 'Soft, highly reactive alkali metal that reacts vigorously with water. Key component of table salt (NaCl).' },
    { num: 12, sym: 'Mg', name: 'Magnesium', mass: '24.305', group: 2, period: 3, cat: 'alkaline-earth', catName: 'Alkaline Earth', block: 's', stateRoom: 'Solid', meltK: 923, boilK: 1363, electron: '[Ne] 3s²', density: '1.738 g/cm³', electro: 1.31, year: '1755 (Black)', summary: 'Shiny gray solid with low density. Central atom in chlorophyll and used in lightweight structural alloys.' },
    { num: 13, sym: 'Al', name: 'Aluminium', mass: '26.982', group: 13, period: 3, cat: 'post-transition', catName: 'Post-Transition Metal', block: 'p', stateRoom: 'Solid', meltK: 933.47, boilK: 2792, electron: '[Ne] 3s² 3p¹', density: '2.70 g/cm³', electro: 1.61, year: '1825 (Ørsted)', summary: 'The most abundant metal in Earth\'s crust. Highly corrosion-resistant and vital for aerospace and transport.' },
    { num: 14, sym: 'Si', name: 'Silicon', mass: '28.085', group: 14, period: 3, cat: 'metalloid', catName: 'Metalloid', block: 'p', stateRoom: 'Solid', meltK: 1687, boilK: 3538, electron: '[Ne] 3s² 3p²', density: '2.329 g/cm³', electro: 1.90, year: '1824 (Berzelius)', summary: 'Fundamental semiconductor powering the global computer revolution, solar panels, and quartz minerals.' },
    { num: 15, sym: 'P', name: 'Phosphorus', mass: '30.974', group: 15, period: 3, cat: 'reactive-nonmetal', catName: 'Reactive Nonmetal', block: 'p', stateRoom: 'Solid', meltK: 317.3, boilK: 553.6, electron: '[Ne] 3s² 3p³', density: '1.823 g/cm³', electro: 2.19, year: '1669 (Brand)', summary: 'Essential nutrient for DNA, RNA, ATP, and cell membranes. Extensively used in agricultural fertilizers.' },
    { num: 16, sym: 'S', name: 'Sulfur', mass: '32.06', group: 16, period: 3, cat: 'reactive-nonmetal', catName: 'Reactive Nonmetal', block: 'p', stateRoom: 'Solid', meltK: 388.36, boilK: 717.8, electron: '[Ne] 3s² 3p⁴', density: '2.07 g/cm³', electro: 2.58, year: 'Ancient', summary: 'Bright yellow crystalline solid. Used in sulfuric acid production, vulcanization of rubber, and gunpowder.' },
    { num: 17, sym: 'Cl', name: 'Chlorine', mass: '35.45', group: 17, period: 3, cat: 'halogen', catName: 'Halogen', block: 'p', stateRoom: 'Gas', meltK: 171.6, boilK: 239.11, electron: '[Ne] 3s² 3p⁵', density: '0.0032 g/cm³', electro: 3.16, year: '1774 (Scheele)', summary: 'Yellow-green halogen gas with strong pungent odor. Widely used for water purification and polyvinyl chloride (PVC).' },
    { num: 18, sym: 'Ar', name: 'Argon', mass: '39.948', group: 18, period: 3, cat: 'noble-gas', catName: 'Noble Gas', block: 'p', stateRoom: 'Gas', meltK: 83.81, boilK: 87.30, electron: '[Ne] 3s² 3p⁶', density: '0.001784 g/cm³', electro: null, year: '1894 (Rayleigh/Ramsay)', summary: 'Third-most abundant atmospheric gas (0.93%). Used as an inert shielding gas in welding and incandescent light bulbs.' },

    { num: 19, sym: 'K', name: 'Potassium', mass: '39.098', group: 1, period: 4, cat: 'alkali-metal', catName: 'Alkali Metal', block: 's', stateRoom: 'Solid', meltK: 336.53, boilK: 1032, electron: '[Ar] 4s¹', density: '0.89 g/cm³', electro: 0.82, year: '1807 (Davy)', summary: 'Silvery-white metal soft enough to be cut with a knife. Critical electrolyte for cellular nerve transmission.' },
    { num: 20, sym: 'Ca', name: 'Calcium', mass: '40.078', group: 2, period: 4, cat: 'alkaline-earth', catName: 'Alkaline Earth', block: 's', stateRoom: 'Solid', meltK: 1115, boilK: 1757, electron: '[Ar] 4s²', density: '1.54 g/cm³', electro: 1.00, year: '1808 (Davy)', summary: 'Essential mineral forming teeth, bones, and shells, as well as concrete and mortar.' },
    { num: 21, sym: 'Sc', name: 'Scandium', mass: '44.956', group: 3, period: 4, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 1814, boilK: 3109, electron: '[Ar] 3d¹ 4s²', density: '2.985 g/cm³', electro: 1.36, year: '1879 (Nilson)', summary: 'Silvery-white transition metal used in aluminum alloys for aerospace parts and sports equipment.' },
    { num: 22, sym: 'Ti', name: 'Titanium', mass: '47.867', group: 4, period: 4, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 1941, boilK: 3560, electron: '[Ar] 3d² 4s²', density: '4.506 g/cm³', electro: 1.54, year: '1791 (Gregor)', summary: 'High strength-to-weight ratio and corrosion resistance. Used in jet engines, spacecraft, and medical implants.' },
    { num: 23, sym: 'V', name: 'Vanadium', mass: '50.942', group: 5, period: 4, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 2183, boilK: 3680, electron: '[Ar] 3d³ 4s²', density: '6.11 g/cm³', electro: 1.63, year: '1801 (del Río)', summary: 'Hard, ductile metal primarily used to strengthen steel alloys and in vanadium redox flow batteries.' },
    { num: 24, sym: 'Cr', name: 'Chromium', mass: '51.996', group: 6, period: 4, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 2180, boilK: 2944, electron: '[Ar] 3d⁵ 4s¹', density: '7.19 g/cm³', electro: 1.66, year: '1797 (Vauquelin)', summary: 'Steely-gray lustrous metal with high polish; essential for stainless steel and chrome electroplating.' },
    { num: 25, sym: 'Mn', name: 'Manganese', mass: '54.938', group: 7, period: 4, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 1519, boilK: 2334, electron: '[Ar] 3d⁵ 4s²', density: '7.21 g/cm³', electro: 1.55, year: '1774 (Gahn)', summary: 'Hard and brittle transition metal indispensable in industrial steelmaking and alkaline battery cathodes.' },
    { num: 26, sym: 'Fe', name: 'Iron', mass: '55.845', group: 8, period: 4, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 1811, boilK: 3134, electron: '[Ar] 3d⁶ 4s²', density: '7.874 g/cm³', electro: 1.83, year: 'Ancient', summary: 'By mass the most common element on Earth; forms the Earth\'s outer and inner core and the backbone of modern civilization.' },
    { num: 27, sym: 'Co', name: 'Cobalt', mass: '58.933', group: 9, period: 4, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 1768, boilK: 3200, electron: '[Ar] 3d⁷ 4s²', density: '8.90 g/cm³', electro: 1.88, year: '1735 (Brandt)', summary: 'Ferromagnetic metal used in lithium-ion battery cathodes, superalloys for gas turbines, and cobalt-blue dyes.' },
    { num: 28, sym: 'Ni', name: 'Nickel', mass: '58.693', group: 10, period: 4, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 1728, boilK: 3003, electron: '[Ar] 3d⁸ 4s²', density: '8.908 g/cm³', electro: 1.91, year: '1751 (Cronstedt)', summary: 'Silvery-white lustrous metal with a slight golden tinge. Key in stainless steel, rechargeable batteries, and coinage.' },
    { num: 29, sym: 'Cu', name: 'Copper', mass: '63.546', group: 11, period: 4, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 1357.77, boilK: 2835, electron: '[Ar] 3d¹⁰ 4s¹', density: '8.96 g/cm³', electro: 1.90, year: 'Ancient', summary: 'Exceptional electrical and thermal conductor; foundational for global electrical wiring, electronics, and bronze/brass alloys.' },
    { num: 30, sym: 'Zn', name: 'Zinc', mass: '65.38', group: 12, period: 4, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 692.68, boilK: 1180, electron: '[Ar] 3d¹⁰ 4s²', density: '7.14 g/cm³', electro: 1.65, year: 'Ancient', summary: 'Used extensively in galvanizing iron to prevent rust, die-casting, and as an essential biological trace mineral.' },
    { num: 31, sym: 'Ga', name: 'Gallium', mass: '69.723', group: 13, period: 4, cat: 'post-transition', catName: 'Post-Transition Metal', block: 'p', stateRoom: 'Solid', meltK: 302.91, boilK: 2673, electron: '[Ar] 3d¹⁰ 4s² 4p¹', density: '5.91 g/cm³', electro: 1.81, year: '1875 (Lecoq)', summary: 'Melts in human hands (29.76 °C). Used in gallium arsenide (GaAs) semiconductors, LEDs, and high-temp thermometers.' },
    { num: 32, sym: 'Ge', name: 'Germanium', mass: '72.630', group: 14, period: 4, cat: 'metalloid', catName: 'Metalloid', block: 'p', stateRoom: 'Solid', meltK: 1211.4, boilK: 3106, electron: '[Ar] 3d¹⁰ 4s² 4p²', density: '5.323 g/cm³', electro: 2.01, year: '1886 (Winkler)', summary: 'Lustrous metalloid used in fiber-optic systems, infrared optics, and solar cell semiconductors.' },
    { num: 33, sym: 'As', name: 'Arsenic', mass: '74.922', group: 15, period: 4, cat: 'metalloid', catName: 'Metalloid', block: 'p', stateRoom: 'Solid', meltK: 1090, boilK: 887, electron: '[Ar] 3d¹⁰ 4s² 4p³', density: '5.776 g/cm³', electro: 2.18, year: 'Ancient', summary: 'Famous for historical toxic compounds, but also utilized as an n-type dopant in semiconductor electronics.' },
    { num: 34, sym: 'Se', name: 'Selenium', mass: '78.971', group: 16, period: 4, cat: 'reactive-nonmetal', catName: 'Reactive Nonmetal', block: 'p', stateRoom: 'Solid', meltK: 494, boilK: 958, electron: '[Ar] 3d¹⁰ 4s² 4p⁴', density: '4.81 g/cm³', electro: 2.55, year: '1817 (Berzelius)', summary: 'Photoconductive nonmetal used in photocells, glass tinting, and as an essential biological dietary micronutrient.' },
    { num: 35, sym: 'Br', name: 'Bromine', mass: '79.904', group: 17, period: 4, cat: 'halogen', catName: 'Halogen', block: 'p', stateRoom: 'Liquid', meltK: 265.8, boilK: 332.0, electron: '[Ar] 3d¹⁰ 4s² 4p⁵', density: '3.1028 g/cm³', electro: 2.96, year: '1826 (Balard)', summary: 'One of only two elements liquid at room temperature; red-brown fuming halogen used in flame retardants and medicines.' },
    { num: 36, sym: 'Kr', name: 'Krypton', mass: '83.798', group: 18, period: 4, cat: 'noble-gas', catName: 'Noble Gas', block: 'p', stateRoom: 'Gas', meltK: 115.78, boilK: 119.93, electron: '[Ar] 3d¹⁰ 4s² 4p⁶', density: '0.003749 g/cm³', electro: 3.00, year: '1898 (Ramsay/Travers)', summary: 'Noble gas with brilliant white-green spectral emission; used in airport runway lights, photographic flashes, and lasers.' },

    { num: 37, sym: 'Rb', name: 'Rubidium', mass: '85.468', group: 1, period: 5, cat: 'alkali-metal', catName: 'Alkali Metal', block: 's', stateRoom: 'Solid', meltK: 312.45, boilK: 961, electron: '[Kr] 5s¹', density: '1.532 g/cm³', electro: 0.82, year: '1861 (Bunsen/Kirchhoff)', summary: 'Highly reactive alkali metal with ignition upon exposure to air; utilized in photocells and atomic clocks.' },
    { num: 38, sym: 'Sr', name: 'Strontium', mass: '87.62', group: 2, period: 5, cat: 'alkaline-earth', catName: 'Alkaline Earth', block: 's', stateRoom: 'Solid', meltK: 1050, boilK: 1650, electron: '[Kr] 5s²', density: '2.64 g/cm³', electro: 0.95, year: '1790 (Crawford)', summary: 'Produces brilliant crimson red flames in pyrotechnics and flares; optical lattice clocks use strontium atoms.' },
    { num: 39, sym: 'Y', name: 'Yttrium', mass: '88.906', group: 3, period: 5, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 1799, boilK: 3203, electron: '[Kr] 4d¹ 5s²', density: '4.472 g/cm³', electro: 1.22, year: '1794 (Gadolin)', summary: 'Rare-earth transition metal used in YBCO high-temperature superconductors, LEDs, and camera lenses.' },
    { num: 40, sym: 'Zr', name: 'Zirconium', mass: '91.224', group: 4, period: 5, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 2128, boilK: 4650, electron: '[Kr] 4d² 5s²', density: '6.52 g/cm³', electro: 1.33, year: '1789 (Klaproth)', summary: 'Exceptional corrosion resistance and low thermal neutron absorption; cladding material for nuclear reactor fuel rods.' },
    { num: 41, sym: 'Nb', name: 'Niobium', mass: '92.906', group: 5, period: 5, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 2750, boilK: 5017, electron: '[Kr] 4d⁴ 5s¹', density: '8.57 g/cm³', electro: 1.6, year: '1801 (Hatchett)', summary: 'Ductile superconducting metal used in MRI superconducting magnets and high-strength pipeline steels.' },
    { num: 42, sym: 'Mo', name: 'Molybdenum', mass: '95.95', group: 6, period: 5, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 2896, boilK: 4912, electron: '[Kr] 4d⁵ 5s¹', density: '10.28 g/cm³', electro: 2.16, year: '1778 (Scheele)', summary: 'High melting point refractory metal; used to harden steel alloys for armor, aircraft parts, and industrial catalysts.' },
    { num: 43, sym: 'Tc', name: 'Technetium', mass: '(98)', group: 7, period: 5, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 2430, boilK: 4538, electron: '[Kr] 4d⁵ 5s²', density: '11 g/cm³', electro: 1.9, year: '1937 (Perrier/Segrè)', summary: 'Lowest atomic-number radioactive element without stable isotopes. Technetium-99m is key for medical diagnostic imaging.' },
    { num: 44, sym: 'Ru', name: 'Ruthenium', mass: '101.07', group: 8, period: 5, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 2607, boilK: 4423, electron: '[Kr] 4d⁷ 5s¹', density: '12.45 g/cm³', electro: 2.2, year: '1844 (Claus)', summary: 'Platinum group metal; hardener for platinum/palladium and catalyst in advanced chemical syntheses.' },
    { num: 45, sym: 'Rh', name: 'Rhodium', mass: '102.91', group: 9, period: 5, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 2237, boilK: 3968, electron: '[Kr] 4d⁸ 5s¹', density: '12.41 g/cm³', electro: 2.28, year: '1803 (Wollaston)', summary: 'Exceedingly rare and valuable noble metal; primarily utilized in automotive catalytic converters and jewelry plating.' },
    { num: 46, sym: 'Pd', name: 'Palladium', mass: '106.42', group: 10, period: 5, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 1828.05, boilK: 3236, electron: '[Kr] 4d¹⁰', density: '12.023 g/cm³', electro: 2.20, year: '1803 (Wollaston)', summary: 'Can absorb up to 900 times its volume in hydrogen gas; crucial catalyst in catalytic converters and organic synthesis.' },
    { num: 47, sym: 'Ag', name: 'Silver', mass: '107.87', group: 11, period: 5, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 1234.93, boilK: 2435, electron: '[Kr] 4d¹⁰ 5s¹', density: '10.49 g/cm³', electro: 1.93, year: 'Ancient', summary: 'Has the highest electrical and thermal conductivity of any known metal, plus natural antimicrobial properties.' },
    { num: 48, sym: 'Cd', name: 'Cadmium', mass: '112.41', group: 12, period: 5, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 594.22, boilK: 1040, electron: '[Kr] 4d¹⁰ 5s²', density: '8.65 g/cm³', electro: 1.69, year: '1817 (Stromeyer)', summary: 'Soft bluish-white metal historically used in NiCd rechargeable batteries and cadmium telluride solar panels.' },
    { num: 49, sym: 'In', name: 'Indium', mass: '114.82', group: 13, period: 5, cat: 'post-transition', catName: 'Post-Transition Metal', block: 'p', stateRoom: 'Solid', meltK: 429.75, boilK: 2345, electron: '[Kr] 4d¹⁰ 5s² 5p¹', density: '7.31 g/cm³', electro: 1.78, year: '1863 (Reich/Richter)', summary: 'Very soft metal; vital component of Indium Tin Oxide (ITO) for touchscreens, LCD flat panels, and solar cells.' },
    { num: 50, sym: 'Sn', name: 'Tin', mass: '118.71', group: 14, period: 5, cat: 'post-transition', catName: 'Post-Transition Metal', block: 'p', stateRoom: 'Solid', meltK: 505.08, boilK: 2875, electron: '[Kr] 4d¹⁰ 5s² 5p²', density: '7.265 g/cm³', electro: 1.96, year: 'Ancient', summary: 'Ancient metal alloyed with copper to create bronze; now heavily utilized in lead-free solder for printed circuit boards.' },
    { num: 51, sym: 'Sb', name: 'Antimony', mass: '121.76', group: 15, period: 5, cat: 'metalloid', catName: 'Metalloid', block: 'p', stateRoom: 'Solid', meltK: 903.78, boilK: 1908, electron: '[Kr] 4d¹⁰ 5s² 5p³', density: '6.697 g/cm³', electro: 2.05, year: 'Ancient', summary: 'Lustrous gray metalloid used in lead-acid battery plates, halogen flame retardants, and infrared detectors.' },
    { num: 52, sym: 'Te', name: 'Tellurium', mass: '127.60', group: 16, period: 5, cat: 'metalloid', catName: 'Metalloid', block: 'p', stateRoom: 'Solid', meltK: 722.66, boilK: 1261, electron: '[Kr] 4d¹⁰ 5s² 5p⁴', density: '6.24 g/cm³', electro: 2.1, year: '1782 (von Reichenstein)', summary: 'Brittle silvery metalloid; key constituent of Cadmium Telluride (CdTe) thin-film photovoltaic solar cells.' },
    { num: 53, sym: 'I', name: 'Iodine', mass: '126.90', group: 17, period: 5, cat: 'halogen', catName: 'Halogen', block: 'p', stateRoom: 'Solid', meltK: 386.85, boilK: 457.4, electron: '[Kr] 4d¹⁰ 5s² 5p⁵', density: '4.933 g/cm³', electro: 2.66, year: '1811 (Courtois)', summary: 'Deep purple-black crystalline solid that sublimates into violet vapor; vital biological element for thyroid hormones.' },
    { num: 54, sym: 'Xe', name: 'Xenon', mass: '131.29', group: 18, period: 5, cat: 'noble-gas', catName: 'Noble Gas', block: 'p', stateRoom: 'Gas', meltK: 161.4, boilK: 165.051, electron: '[Kr] 4d¹⁰ 5s² 5p⁶', density: '0.005894 g/cm³', electro: 2.6, year: '1898 (Ramsay/Travers)', summary: 'Heavy noble gas used in xenon flash lamps, ion propulsion thrusters on deep-space satellites, and general anesthesia.' },

    { num: 55, sym: 'Cs', name: 'Caesium', mass: '132.91', group: 1, period: 6, cat: 'alkali-metal', catName: 'Alkali Metal', block: 's', stateRoom: 'Solid', meltK: 301.7, boilK: 944, electron: '[Xe] 6s¹', density: '1.93 g/cm³', electro: 0.79, year: '1860 (Bunsen/Kirchhoff)', summary: 'Extremely reactive gold-colored alkali metal; the vibration of the caesium-133 atom defines the SI standard second.' },
    { num: 56, sym: 'Ba', name: 'Barium', mass: '137.33', group: 2, period: 6, cat: 'alkaline-earth', catName: 'Alkaline Earth', block: 's', stateRoom: 'Solid', meltK: 1000, boilK: 2170, electron: '[Xe] 6s²', density: '3.51 g/cm³', electro: 0.89, year: '1772 (Scheele)', summary: 'High-density alkaline earth metal; barium sulfate is widely used in medical gastrointestinal X-ray contrast meals.' },

    // Lanthanides (57 to 71)
    { num: 57, sym: 'La', name: 'Lanthanum', mass: '138.91', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1193, boilK: 3737, electron: '[Xe] 5d¹ 6s²', density: '6.162 g/cm³', electro: 1.1, year: '1839 (Mosander)', summary: 'Namesake of the lanthanide series; used in carbon arc studio lighting and hybrid vehicle battery electrodes.' },
    { num: 58, sym: 'Ce', name: 'Cerium', mass: '140.12', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1068, boilK: 3716, electron: '[Xe] 4f¹ 5d¹ 6s²', density: '6.77 g/cm³', electro: 1.12, year: '1803 (Berzelius/Hisinger)', summary: 'Most abundant rare-earth metal; major component of ferrocerium flint lighters and self-cleaning oven walls.' },
    { num: 59, sym: 'Pr', name: 'Praseodymium', mass: '140.91', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1208, boilK: 3793, electron: '[Xe] 4f³ 6s²', density: '6.77 g/cm³', electro: 1.13, year: '1885 (von Welsbach)', summary: 'Soft malleable metal; alloyed with neodymium in high-strength magnets and yellow/green glass tinting.' },
    { num: 60, sym: 'Nd', name: 'Neodymium', mass: '144.24', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1297, boilK: 3347, electron: '[Xe] 4f⁴ 6s²', density: '7.01 g/cm³', electro: 1.14, year: '1885 (von Welsbach)', summary: 'Forms the strongest known permanent magnets (NdFeB), crucial for EV motors, wind turbines, and hard drives.' },
    { num: 61, sym: 'Pm', name: 'Promethium', mass: '(145)', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1315, boilK: 3273, electron: '[Xe] 4f⁵ 6s²', density: '7.26 g/cm³', electro: 1.13, year: '1945 (Marinsky/Glendenin)', summary: 'Extremely rare radioactive lanthanide; used in atomic batteries for pacemakers and luminous paint dials.' },
    { num: 62, sym: 'Sm', name: 'Samarium', mass: '150.36', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1345, boilK: 2067, electron: '[Xe] 4f⁶ 6s²', density: '7.52 g/cm³', electro: 1.17, year: '1879 (Lecoq)', summary: 'Used with cobalt in temperature-resistant permanent magnets (SmCo) that operate reliably at up to 500 °C.' },
    { num: 63, sym: 'Eu', name: 'Europium', mass: '151.96', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1099, boilK: 1802, electron: '[Xe] 4f⁷ 6s²', density: '5.244 g/cm³', electro: 1.2, year: '1901 (Demarçay)', summary: 'Produces brilliant red luminescence in TV screens and anti-counterfeiting phosphors on Euro banknotes.' },
    { num: 64, sym: 'Gd', name: 'Gadolinium', mass: '157.25', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1585, boilK: 3546, electron: '[Xe] 4f⁷ 5d¹ 6s²', density: '7.90 g/cm³', electro: 1.2, year: '1880 (de Marignac)', summary: 'High magnetic moment; standard MRI contrast enhancement agent and neutron absorber in nuclear power.' },
    { num: 65, sym: 'Tb', name: 'Terbium', mass: '158.93', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1629, boilK: 3503, electron: '[Xe] 4f⁹ 6s²', density: '8.23 g/cm³', electro: 1.2, year: '1843 (Mosander)', summary: 'Produces green phosphors in fluorescent lighting and optical devices; component of Terfenol-D magnetostrictive alloys.' },
    { num: 66, sym: 'Dy', name: 'Dysprosium', mass: '162.50', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1680, boilK: 2840, electron: '[Xe] 4f¹⁰ 6s²', density: '8.54 g/cm³', electro: 1.22, year: '1886 (Lecoq)', summary: 'High magnetic susceptibility; added to neodymium magnets to preserve magnet strength at high temperatures.' },
    { num: 67, sym: 'Ho', name: 'Holmium', mass: '164.93', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1734, boilK: 2993, electron: '[Xe] 4f¹¹ 6s²', density: '8.79 g/cm³', electro: 1.23, year: '1878 (Delafontaine/Soret)', summary: 'Has the highest magnetic permeability of any element; used to concentrate flux lines in high-field magnets.' },
    { num: 68, sym: 'Er', name: 'Erbium', mass: '167.26', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1802, boilK: 3141, electron: '[Xe] 4f¹² 6s²', density: '9.066 g/cm³', electro: 1.24, year: '1843 (Mosander)', summary: 'Provides pink coloration in glass and forms Erbium-Doped Fiber Amplifiers (EDFAs) powering global internet cables.' },
    { num: 69, sym: 'Tm', name: 'Thulium', mass: '168.93', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1818, boilK: 2223, electron: '[Xe] 4f¹³ 6s²', density: '9.32 g/cm³', electro: 1.25, year: '1879 (Cleve)', summary: 'Second-least abundant naturally occurring lanthanide; utilized in portable surgical X-ray devices and lasers.' },
    { num: 70, sym: 'Yb', name: 'Ytterbium', mass: '173.05', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'f', stateRoom: 'Solid', meltK: 1097, boilK: 1469, electron: '[Xe] 4f¹⁴ 6s²', density: '6.90 g/cm³', electro: 1.1, year: '1878 (de Marignac)', summary: 'Soft rare earth metal; used in atomic clocks and as a dopant in high-power industrial fiber laser cutting.' },
    { num: 71, sym: 'Lu', name: 'Lutetium', mass: '174.97', group: 3, period: 6, cat: 'lanthanide', catName: 'Lanthanide', block: 'd', stateRoom: 'Solid', meltK: 1925, boilK: 3675, electron: '[Xe] 4f¹⁴ 5d¹ 6s²', density: '9.841 g/cm³', electro: 1.27, year: '1907 (von Welsbach/Urbain)', summary: 'Hardest and densest lanthanide; used in PET scanners and petroleum refinery catalytic cracking.' },

    // Period 6 Transition & Post-transition metals
    { num: 72, sym: 'Hf', name: 'Hafnium', mass: '178.49', group: 4, period: 6, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 2506, boilK: 4876, electron: '[Xe] 4f¹⁴ 5d² 6s²', density: '13.31 g/cm³', electro: 1.3, year: '1923 (Coster/de Hevesy)', summary: 'Excellent neutron capture cross-section; nuclear control rods in nuclear submarines and CPU gate dielectrics.' },
    { num: 73, sym: 'Ta', name: 'Tantalum', mass: '180.95', group: 5, period: 6, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 3290, boilK: 5731, electron: '[Xe] 4f¹⁴ 5d³ 6s²', density: '16.69 g/cm³', electro: 1.5, year: '1802 (Ekeberg)', summary: 'Extremely corrosion resistant; irreplaceable in micro-capacitors inside smartphones and computer hardware.' },
    { num: 74, sym: 'W', name: 'Tungsten', mass: '183.84', group: 6, period: 6, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 3695, boilK: 5828, electron: '[Xe] 4f¹⁴ 5d⁴ 6s²', density: '19.25 g/cm³', electro: 2.36, year: '1781 (Scheele)', summary: 'Has the highest melting point of all pure elements (3422 °C); incandescent filaments, kinetic armor penetrators.' },
    { num: 75, sym: 'Re', name: 'Rhenium', mass: '186.21', group: 7, period: 6, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 3459, boilK: 5869, electron: '[Xe] 4f¹⁴ 5d⁵ 6s²', density: '21.02 g/cm³', electro: 1.9, year: '1925 (Noddack/Tacke)', summary: 'One of the rarest elements in Earth\'s crust; critical nickel-based superalloys for commercial jet turbine blades.' },
    { num: 76, sym: 'Os', name: 'Osmium', mass: '190.23', group: 8, period: 6, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 3306, boilK: 5285, electron: '[Xe] 4f¹⁴ 5d⁶ 6s²', density: '22.59 g/cm³', electro: 2.2, year: '1803 (Tennant)', summary: 'The densest naturally occurring element on Earth; used in fountain pen tips, electrical contacts, and forensic staining.' },
    { num: 77, sym: 'Ir', name: 'Iridium', mass: '192.22', group: 9, period: 6, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 2719, boilK: 4701, electron: '[Xe] 4f¹⁴ 5d⁷ 6s²', density: '22.56 g/cm³', electro: 2.20, year: '1803 (Tennant)', summary: 'The most corrosion-resistant metal known; the geological KT boundary layer of iridium confirmed dinosaur asteroid impact.' },
    { num: 78, sym: 'Pt', name: 'Platinum', mass: '195.08', group: 10, period: 6, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 2041.4, boilK: 4098, electron: '[Xe] 4f¹⁴ 5d⁹ 6s¹', density: '21.45 g/cm³', electro: 2.28, year: '1735 (Ulloa)', summary: 'Dense, malleable, precious metal; vital catalyst in catalytic converters, cancer chemotherapy (cisplatin), and jewelry.' },
    { num: 79, sym: 'Au', name: 'Gold', mass: '196.97', group: 11, period: 6, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 1337.33, boilK: 3129, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', density: '19.3 g/cm³', electro: 2.54, year: 'Ancient', summary: 'Highly prized malleable noble metal that never oxidizes; global monetary standard, jewelry, and corrosion-free chip bonding.' },
    { num: 80, sym: 'Hg', name: 'Mercury', mass: '200.59', group: 12, period: 6, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Liquid', meltK: 234.32, boilK: 629.88, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', density: '13.534 g/cm³', electro: 2.00, year: 'Ancient', summary: 'Only metallic element that is liquid at standard temperature and pressure; historically used in barometers and amalgams.' },
    { num: 81, sym: 'Tl', name: 'Thallium', mass: '204.38', group: 13, period: 6, cat: 'post-transition', catName: 'Post-Transition Metal', block: 'p', stateRoom: 'Solid', meltK: 577, boilK: 1746, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', density: '11.85 g/cm³', electro: 1.62, year: '1861 (Crookes)', summary: 'Soft, gray malleable post-transition metal; used in specialized optical lenses, infrared optics, and electronics.' },
    { num: 82, sym: 'Pb', name: 'Lead', mass: '207.2', group: 14, period: 6, cat: 'post-transition', catName: 'Post-Transition Metal', block: 'p', stateRoom: 'Solid', meltK: 600.61, boilK: 2022, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', density: '11.34 g/cm³', electro: 1.87, year: 'Ancient', summary: 'Heavy, malleable, dense metal; widely used in lead-acid automotive batteries and radiation shielding.' },
    { num: 83, sym: 'Bi', name: 'Bismuth', mass: '208.98', group: 15, period: 6, cat: 'post-transition', catName: 'Post-Transition Metal', block: 'p', stateRoom: 'Solid', meltK: 544.7, boilK: 1837, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', density: '9.78 g/cm³', electro: 2.02, year: '1753 (Geoffroy)', summary: 'Shows rainbow oxidation colors and spiral crystals; non-toxic heavy metal replacement and active ingredient in Pepto-Bismol.' },
    { num: 84, sym: 'Po', name: 'Polonium', mass: '(209)', group: 16, period: 6, cat: 'post-transition', catName: 'Post-Transition Metal', block: 'p', stateRoom: 'Solid', meltK: 527, boilK: 1235, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', density: '9.196 g/cm³', electro: 2.0, year: '1898 (Curie)', summary: 'Discovered by Marie and Pierre Curie; intensely radioactive alpha emitter used as an anti-static agent and thermal power source.' },
    { num: 85, sym: 'At', name: 'Astatine', mass: '(210)', group: 17, period: 6, cat: 'halogen', catName: 'Halogen', block: 'p', stateRoom: 'Solid', meltK: 575, boilK: 610, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', density: '6.35 g/cm³', electro: 2.2, year: '1940 (Corson/MacKenzie)', summary: 'Rarest naturally occurring element in Earth\'s crust (< 1 gram at any time); targeted alpha therapy for cancer.' },
    { num: 86, sym: 'Rn', name: 'Radon', mass: '(222)', group: 18, period: 6, cat: 'noble-gas', catName: 'Noble Gas', block: 'p', stateRoom: 'Gas', meltK: 202, boilK: 211.3, electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', density: '0.00973 g/cm³', electro: 2.2, year: '1900 (Dorn)', summary: 'Radioactive, colorless noble gas produced by uranium decay; major cause of lung cancer in poorly ventilated basements.' },

    // Period 7
    { num: 87, sym: 'Fr', name: 'Francium', mass: '(223)', group: 1, period: 7, cat: 'alkali-metal', catName: 'Alkali Metal', block: 's', stateRoom: 'Solid', meltK: 300, boilK: 950, electron: '[Rn] 7s¹', density: '1.87 g/cm³', electro: 0.79, year: '1939 (Perey)', summary: 'Extremely unstable radioactive alkali metal with half-life of 22 minutes; used in atomic physics spectroscopy.' },
    { num: 88, sym: 'Ra', name: 'Radium', mass: '(226)', group: 2, period: 7, cat: 'alkaline-earth', catName: 'Alkaline Earth', block: 's', stateRoom: 'Solid', meltK: 1233, boilK: 2010, electron: '[Rn] 7s²', density: '5.5 g/cm³', electro: 0.9, year: '1898 (Curie)', summary: 'Discovered by the Curies; luminesces faint blue in the dark; historically used in radioluminescent watch dials.' },

    // Actinides (89 to 103)
    { num: 89, sym: 'Ac', name: 'Actinium', mass: '(227)', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 1323, boilK: 3471, electron: '[Rn] 6d¹ 7s²', density: '10.07 g/cm³', electro: 1.1, year: '1899 (Debierne)', summary: 'Glows with eerie blue light due to intense radioactivity; targeted alpha radiation therapy in oncology.' },
    { num: 90, sym: 'Th', name: 'Thorium', mass: '232.04', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 2115, boilK: 5061, electron: '[Rn] 6d² 7s²', density: '11.72 g/cm³', electro: 1.3, year: '1829 (Berzelius)', summary: 'Naturally occurring fertile nuclear fuel three times more abundant than uranium; researched for molten-salt reactors.' },
    { num: 91, sym: 'Pa', name: 'Protactinium', mass: '231.04', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 1841, boilK: 4300, electron: '[Rn] 5f² 6d¹ 7s²', density: '15.37 g/cm³', electro: 1.5, year: '1913 (Fajans/Göhring)', summary: 'Dense silvery radioactive actinide formed during uranium decay; primarily utilized in scientific research.' },
    { num: 92, sym: 'U', name: 'Uranium', mass: '238.03', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 1405.3, boilK: 4404, electron: '[Rn] 5f³ 6d¹ 7s²', density: '19.1 g/cm³', electro: 1.38, year: '1789 (Klaproth)', summary: 'Heaviest primordial element; fissile isotope U-235 is the primary fuel for commercial nuclear power and atomic weapons.' },
    { num: 93, sym: 'Np', name: 'Neptunium', mass: '(237)', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 917, boilK: 4273, electron: '[Rn] 5f⁴ 6d¹ 7s²', density: '20.45 g/cm³', electro: 1.36, year: '1940 (McMillan/Abelson)', summary: 'First transuranic element synthesized; byproduct in nuclear reactors and precursor to plutonium-238 production.' },
    { num: 94, sym: 'Pu', name: 'Plutonium', mass: '(244)', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 912.5, boilK: 3501, electron: '[Rn] 5f⁶ 7s²', density: '19.816 g/cm³', electro: 1.28, year: '1940 (Seaborg)', summary: 'Fissile isotope Pu-239 fuels nuclear weapons; Pu-238 radioisotope thermoelectric generators power the Voyager and Curiosity spacecraft.' },
    { num: 95, sym: 'Am', name: 'Americium', mass: '(243)', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 1449, boilK: 2880, electron: '[Rn] 5f⁷ 7s²', density: '12 g/cm³', electro: 1.13, year: '1944 (Seaborg)', summary: 'Synthetic actinide; tiny amounts of americium-241 ionize air in millions of household smoke detectors worldwide.' },
    { num: 96, sym: 'Cm', name: 'Curium', mass: '(247)', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 1613, boilK: 3383, electron: '[Rn] 5f⁷ 6d¹ 7s²', density: '13.51 g/cm³', electro: 1.28, year: '1944 (Seaborg)', summary: 'Named after Marie and Pierre Curie; strong alpha emitter used in alpha particle X-ray spectrometers on Mars rovers.' },
    { num: 97, sym: 'Bk', name: 'Berkelium', mass: '(247)', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 1259, boilK: 2900, electron: '[Rn] 5f⁹ 7s²', density: '14.78 g/cm³', electro: 1.3, year: '1949 (Thompson/Seaborg)', summary: 'Synthesized at UC Berkeley; used as target material to synthesize heavier superheavy elements like tennessine.' },
    { num: 98, sym: 'Cf', name: 'Californium', mass: '(251)', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 1173, boilK: 1743, electron: '[Rn] 5f¹⁰ 7s²', density: '15.1 g/cm³', electro: 1.3, year: '1950 (Thompson/Seaborg)', summary: 'Practical neutron emitter; used to detect water in oil wells, start up nuclear reactors, and verify airport luggage.' },
    { num: 99, sym: 'Es', name: 'Einsteinium', mass: '(252)', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 1133, boilK: 1269, electron: '[Rn] 5f¹¹ 7s²', density: '8.84 g/cm³', electro: 1.3, year: '1952 (Ghiorso)', summary: 'Discovered in the debris of the first thermonuclear hydrogen bomb explosion (Ivy Mike); named after Albert Einstein.' },
    { num: 100, sym: 'Fm', name: 'Fermium', mass: '(257)', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 1800, boilK: null, electron: '[Rn] 5f¹² 7s²', density: '9.7 g/cm³', electro: 1.3, year: '1952 (Ghiorso)', summary: 'Heaviest element that can be formed by neutron bombardment of lighter elements; named after Enrico Fermi.' },
    { num: 101, sym: 'Md', name: 'Mendelevium', mass: '(258)', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 1100, boilK: null, electron: '[Rn] 5f¹³ 7s²', density: '10.3 g/cm³', electro: 1.3, year: '1955 (Ghiorso/Seaborg)', summary: 'Synthesized by bombarding einsteinium with alpha particles; named after Dmitri Mendeleev, father of the periodic table.' },
    { num: 102, sym: 'No', name: 'Nobelium', mass: '(259)', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'f', stateRoom: 'Solid', meltK: 1100, boilK: null, electron: '[Rn] 5f¹⁴ 7s²', density: '9.9 g/cm³', electro: 1.3, year: '1966 (JINR Dubna)', summary: 'Radioactive synthetic transuranic element named after Alfred Nobel; only microgram amounts ever produced.' },
    { num: 103, sym: 'Lr', name: 'Lawrencium', mass: '(266)', group: 3, period: 7, cat: 'actinide', catName: 'Actinide', block: 'd', stateRoom: 'Solid', meltK: 1900, boilK: null, electron: '[Rn] 5f¹⁴ 7s² 7p¹', density: '14.4 g/cm³', electro: 1.3, year: '1961 (Ghiorso)', summary: 'Final actinide element; named after Ernest Lawrence, inventor of the cyclotron particle accelerator.' },

    // Superheavy elements (104 to 118)
    { num: 104, sym: 'Rf', name: 'Rutherfordium', mass: '(267)', group: 4, period: 7, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: 2400, boilK: 5800, electron: '[Rn] 5f¹⁴ 6d² 7s²', density: '23.2 g/cm³', electro: null, year: '1969 (JINR/Berkeley)', summary: 'First transactinide element; synthetic radioactive metal named after nuclear physics pioneer Ernest Rutherford.' },
    { num: 105, sym: 'Db', name: 'Dubnium', mass: '(268)', group: 5, period: 7, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: null, boilK: null, electron: '[Rn] 5f¹⁴ 6d³ 7s²', density: '29.3 g/cm³', electro: null, year: '1970 (JINR/Berkeley)', summary: 'Synthetic element produced by particle accelerators; named after the Russian research town of Dubna.' },
    { num: 106, sym: 'Sg', name: 'Seaborgium', mass: '(269)', group: 6, period: 7, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: null, boilK: null, electron: '[Rn] 5f¹⁴ 6d⁴ 7s²', density: '35.0 g/cm³', electro: null, year: '1974 (Berkeley)', summary: 'Named after Glenn T. Seaborg, the first living person to have a chemical element named in his honor.' },
    { num: 107, sym: 'Bh', name: 'Bohrium', mass: '(270)', group: 7, period: 7, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: null, boilK: null, electron: '[Rn] 5f¹⁴ 6d⁵ 7s²', density: '37.1 g/cm³', electro: null, year: '1981 (GSI Darmstadt)', summary: 'Synthetic superheavy element named after Danish Nobel-winning quantum physicist Niels Bohr.' },
    { num: 108, sym: 'Hs', name: 'Hassium', mass: '(269)', group: 8, period: 7, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Solid', meltK: null, boilK: null, electron: '[Rn] 5f¹⁴ 6d⁶ 7s²', density: '40.7 g/cm³', electro: null, year: '1984 (GSI Darmstadt)', summary: 'Synthesized by bombarding lead-208 with iron-58 nuclei; predicted to be an extraordinarily dense metal.' },
    { num: 109, sym: 'Mt', name: 'Meitnerium', mass: '(278)', group: 9, period: 7, cat: 'unknown', catName: 'Unknown / Synthetic', block: 'd', stateRoom: 'Solid', meltK: null, boilK: null, electron: '[Rn] 5f¹⁴ 6d⁷ 7s²', density: '37.4 g/cm³', electro: null, year: '1982 (GSI Darmstadt)', summary: 'Named in honor of Austrian-Swedish physicist Lise Meitner, discoverer of nuclear fission.' },
    { num: 110, sym: 'Ds', name: 'Darmstadtium', mass: '(281)', group: 10, period: 7, cat: 'unknown', catName: 'Unknown / Synthetic', block: 'd', stateRoom: 'Solid', meltK: null, boilK: null, electron: '[Rn] 5f¹⁴ 6d⁸ 7s²', density: '34.8 g/cm³', electro: null, year: '1994 (GSI Darmstadt)', summary: 'Discovered at the GSI Helmholtz Centre for Heavy Ion Research near Darmstadt, Germany.' },
    { num: 111, sym: 'Rg', name: 'Roentgenium', mass: '(282)', group: 11, period: 7, cat: 'unknown', catName: 'Unknown / Synthetic', block: 'd', stateRoom: 'Solid', meltK: null, boilK: null, electron: '[Rn] 5f¹⁴ 6d⁹ 7s²', density: '28.7 g/cm³', electro: null, year: '1994 (GSI Darmstadt)', summary: 'Named after Wilhelm Conrad Röntgen, the discoverer of X-rays.' },
    { num: 112, sym: 'Cn', name: 'Copernicium', mass: '(285)', group: 12, period: 7, cat: 'transition-metal', catName: 'Transition Metal', block: 'd', stateRoom: 'Liquid', meltK: 283, boilK: 340, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', density: '23.7 g/cm³', electro: null, year: '1996 (GSI Darmstadt)', summary: 'Named after astronomer Nicolaus Copernicus; predicted to behave somewhat like a volatile noble metal.' },
    { num: 113, sym: 'Nh', name: 'Nihonium', mass: '(286)', group: 13, period: 7, cat: 'unknown', catName: 'Unknown / Synthetic', block: 'p', stateRoom: 'Solid', meltK: 700, boilK: 1400, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', density: '16 g/cm³', electro: null, year: '2004 (RIKEN Japan)', summary: 'First element discovered in an Asian laboratory (RIKEN, Japan); named after Nihon (Japan).' },
    { num: 114, sym: 'Fl', name: 'Flerovium', mass: '(289)', group: 14, period: 7, cat: 'unknown', catName: 'Unknown / Synthetic', block: 'p', stateRoom: 'Solid', meltK: 200, boilK: 380, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', density: '14 g/cm³', electro: null, year: '1998 (JINR/LLNL)', summary: 'Superheavy element located near the theoretical "Island of Stability"; named after Flerov Laboratory.' },
    { num: 115, sym: 'Mc', name: 'Moscovium', mass: '(290)', group: 15, period: 7, cat: 'unknown', catName: 'Unknown / Synthetic', block: 'p', stateRoom: 'Solid', meltK: 670, boilK: 1400, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', density: '13.5 g/cm³', electro: null, year: '2003 (JINR/LLNL)', summary: 'Extremely radioactive synthetic element named in honor of the Moscow Oblast region.' },
    { num: 116, sym: 'Lv', name: 'Livermorium', mass: '(293)', group: 16, period: 7, cat: 'unknown', catName: 'Unknown / Synthetic', block: 'p', stateRoom: 'Solid', meltK: 709, boilK: 1085, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', density: '12.9 g/cm³', electro: null, year: '2000 (JINR/LLNL)', summary: 'Named after the Lawrence Livermore National Laboratory in California.' },
    { num: 117, sym: 'Ts', name: 'Tennessine', mass: '(294)', group: 17, period: 7, cat: 'unknown', catName: 'Unknown / Synthetic', block: 'p', stateRoom: 'Solid', meltK: 723, boilK: 883, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', density: '7.2 g/cm³', electro: null, year: '2010 (JINR/Oak Ridge)', summary: 'Second-heaviest known element; named after Tennessee, home of Oak Ridge National Laboratory.' },
    { num: 118, sym: 'Og', name: 'Oganesson', mass: '(294)', group: 18, period: 7, cat: 'noble-gas', catName: 'Noble Gas', block: 'p', stateRoom: 'Solid', meltK: 325, boilK: 450, electron: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', density: '5.0 g/cm³', electro: null, year: '2002 (JINR/LLNL)', summary: 'Highest atomic number (118) and highest atomic mass of all synthesized elements; named after Yuri Oganessian.' }
  ];

  // State
  let currentCategory = 'all';
  let currentStateFilter = 'all';
  let currentTemperatureK = 298; // 25 °C room temp
  let searchQuery = '';

  // DOM Elements
  const ptableGrid = document.getElementById('ptable-grid');
  const categoryChips = document.querySelectorAll('.cat-legend-chip');
  const stateChips = document.querySelectorAll('.preset-chip[data-state]');
  const tempSlider = document.getElementById('temp-slider');
  const dispTempVal = document.getElementById('disp-temp-val');
  const searchInput = document.getElementById('el-search-input');
  const btnResetFilters = document.getElementById('btn-reset-filters');

  // Modal Elements
  const modal = document.getElementById('element-modal');
  const modalClose = document.getElementById('modal-close');
  const modalAtomicNum = document.getElementById('modal-atomic-num');
  const modalSymbol = document.getElementById('modal-symbol');
  const modalName = document.getElementById('modal-name');
  const modalCategory = document.getElementById('modal-category');
  const modalStateRoom = document.getElementById('modal-state-room');
  const modalWeight = document.getElementById('modal-weight');
  const modalElectron = document.getElementById('modal-electron');
  const modalMelt = document.getElementById('modal-melt');
  const modalBoil = document.getElementById('modal-boil');
  const modalDensity = document.getElementById('modal-density');
  const modalElectro = document.getElementById('modal-electro');
  const modalGridPos = document.getElementById('modal-grid-pos');
  const modalDiscover = document.getElementById('modal-discover');
  const modalSummary = document.getElementById('modal-summary');
  const modalSymBox = document.getElementById('modal-sym-box');

  // Compute thermal state for element at temperature T (Kelvin)
  function getThermalState(el, tempK) {
    if (el.meltK === null || el.boilK === null) {
      return el.stateRoom;
    }
    if (tempK < el.meltK) return 'Solid';
    if (tempK >= el.meltK && tempK < el.boilK) return 'Liquid';
    return 'Gas';
  }

  // Determine grid row and column for each element
  function getGridPosition(el) {
    // Lanthanides (57 to 71): Row 9, Col 4 to 18
    if (el.num >= 57 && el.num <= 71) {
      return { row: 9, col: el.num - 57 + 4 };
    }
    // Actinides (89 to 103): Row 10, Col 4 to 18
    if (el.num >= 89 && el.num <= 103) {
      return { row: 10, col: el.num - 89 + 4 };
    }

    // Main periods (1 to 7)
    let r = el.period;
    let c = el.group;
    return { row: r, col: c };
  }

  // Render Periodic Table Cells
  function renderTable() {
    ptableGrid.innerHTML = '';

    // Insert Lanthanide placeholder card at row 6, col 3
    const laPlaceholder = document.createElement('div');
    laPlaceholder.className = 'element-cell cat-lanthanide';
    laPlaceholder.style.gridRow = '6';
    laPlaceholder.style.gridColumn = '3';
    laPlaceholder.style.justifyContent = 'center';
    laPlaceholder.style.alignItems = 'center';
    laPlaceholder.style.cursor = 'default';
    laPlaceholder.innerHTML = `
      <div style="font-size: 0.7rem; font-weight: 700; color: #a5b4fc; text-align: center;">57-71</div>
      <div style="font-size: 0.65rem; color: var(--text-secondary); text-align: center;">La-Lu</div>
    `;
    ptableGrid.appendChild(laPlaceholder);

    // Insert Actinide placeholder card at row 7, col 3
    const acPlaceholder = document.createElement('div');
    acPlaceholder.className = 'element-cell cat-actinide';
    acPlaceholder.style.gridRow = '7';
    acPlaceholder.style.gridColumn = '3';
    acPlaceholder.style.justifyContent = 'center';
    acPlaceholder.style.alignItems = 'center';
    acPlaceholder.style.cursor = 'default';
    acPlaceholder.innerHTML = `
      <div style="font-size: 0.7rem; font-weight: 700; color: #fda4af; text-align: center;">89-103</div>
      <div style="font-size: 0.65rem; color: var(--text-secondary); text-align: center;">Ac-Lr</div>
    `;
    ptableGrid.appendChild(acPlaceholder);

    // Create cells for all 118 elements
    ELEMENTS.forEach(el => {
      const pos = getGridPosition(el);
      const stateNow = getThermalState(el, currentTemperatureK);

      const cell = document.createElement('div');
      cell.className = `element-cell cat-${el.cat}`;
      cell.dataset.num = el.num;
      cell.style.gridRow = `${pos.row}`;
      cell.style.gridColumn = `${pos.col}`;

      // State dot class
      const stateDotClass = `state-${stateNow.toLowerCase()}`;

      cell.innerHTML = `
        <div class="el-num">${el.num}</div>
        <span class="el-state-indicator ${stateDotClass}" title="State: ${stateNow} at ${currentTemperatureK} K"></span>
        <div class="el-sym">${el.sym}</div>
        <div class="el-name">${el.name}</div>
        <div class="el-mass">${el.mass}</div>
      `;

      cell.addEventListener('click', () => openElementModal(el));
      ptableGrid.appendChild(cell);
    });

    applyFilters();
  }

  // Apply Search, Category, and State Filters
  function applyFilters() {
    const q = searchQuery.toLowerCase().trim();
    const cells = document.querySelectorAll('.element-cell[data-num]');

    cells.forEach(cell => {
      const num = parseInt(cell.dataset.num, 10);
      const el = ELEMENTS[num - 1];
      const stateNow = getThermalState(el, currentTemperatureK);

      // 1. Category check
      const matchCat = (currentCategory === 'all' || el.cat === currentCategory);

      // 2. State check
      const matchState = (currentStateFilter === 'all' || stateNow === currentStateFilter);

      // 3. Search check (Name, Symbol, Number)
      const matchSearch = (!q ||
        el.name.toLowerCase().includes(q) ||
        el.sym.toLowerCase() === q ||
        String(el.num) === q
      );

      if (matchCat && matchState && matchSearch) {
        cell.classList.remove('dimmed');
        if (q && (el.sym.toLowerCase() === q || String(el.num) === q)) {
          cell.classList.add('highlighted');
        } else {
          cell.classList.remove('highlighted');
        }
      } else {
        cell.classList.add('dimmed');
        cell.classList.remove('highlighted');
      }
    });
  }

  // Modal Display
  function openElementModal(el) {
    const stateNow = getThermalState(el, currentTemperatureK);

    modalAtomicNum.textContent = el.num;
    modalSymbol.textContent = el.sym;
    modalName.textContent = el.name;
    modalCategory.textContent = el.catName;
    modalStateRoom.textContent = `${el.stateRoom} at 298 K (${stateNow} at ${currentTemperatureK} K)`;

    modalWeight.textContent = `${el.mass} u`;
    modalElectron.textContent = el.electron;
    modalMelt.textContent = el.meltK ? `${el.meltK} K (${(el.meltK - 273.15).toFixed(1)} °C)` : 'Unknown';
    modalBoil.textContent = el.boilK ? `${el.boilK} K (${(el.boilK - 273.15).toFixed(1)} °C)` : 'Unknown';
    modalDensity.textContent = el.density || 'Unknown';
    modalElectro.textContent = el.electro ? `${el.electro} Pauling` : 'N/A';
    modalGridPos.textContent = `Period ${el.period}, Group ${el.group || 'N/A'} (${el.block}-block)`;
    modalDiscover.textContent = el.year;
    modalSummary.textContent = el.summary;

    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // --- Category Filter Listener ---
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.dataset.cat;
      applyFilters();
    });
  });

  // --- State Filter Listener ---
  stateChips.forEach(chip => {
    chip.addEventListener('click', () => {
      stateChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentStateFilter = chip.dataset.state;
      applyFilters();
    });
  });

  // --- Temperature Slider Listener ---
  tempSlider.addEventListener('input', () => {
    currentTemperatureK = parseInt(tempSlider.value, 10);
    const celsius = currentTemperatureK - 273.15;
    dispTempVal.innerHTML = `${currentTemperatureK} K (${Math.round(celsius)} &deg;C)`;

    // Update state dots on all element cells
    document.querySelectorAll('.element-cell[data-num]').forEach(cell => {
      const num = parseInt(cell.dataset.num, 10);
      const el = ELEMENTS[num - 1];
      const stateNow = getThermalState(el, currentTemperatureK);
      const dot = cell.querySelector('.el-state-indicator');
      if (dot) {
        dot.className = `el-state-indicator state-${stateNow.toLowerCase()}`;
        dot.title = `State: ${stateNow} at ${currentTemperatureK} K`;
      }
    });

    applyFilters();
  });

  // --- Search Input Listener ---
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    applyFilters();
  });

  // --- Reset Filters ---
  btnResetFilters.addEventListener('click', () => {
    searchQuery = '';
    searchInput.value = '';
    currentCategory = 'all';
    currentStateFilter = 'all';
    currentTemperatureK = 298;
    tempSlider.value = 298;
    dispTempVal.innerHTML = '298 K (25 &deg;C)';

    categoryChips.forEach(c => c.classList.remove('active'));
    categoryChips[0].classList.add('active');

    stateChips.forEach(c => c.classList.remove('active'));
    stateChips[0].classList.add('active');

    renderTable();
  });

  // Initial table render
  renderTable();
});