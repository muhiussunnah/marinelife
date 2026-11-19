/**
 * SEO copy for the listing category pages (/listings/<slug>).
 * One entry per slug in LISTING_CATEGORIES (lib/listings-meta.ts).
 */

export interface CategoryIntro {
  metaTitle: string
  metaDescription: string
  h1: string
  intro: string
}

export const CATEGORY_INTROS: Record<string, CategoryIntro> = {
  'main-engine': {
    metaTitle: 'Marine Main Engine Parts & Spares for Sale | MarineYard',
    metaDescription:
      'Buy and sell marine main engine parts worldwide: pistons, liners, cylinder heads, crankshafts, fuel pumps and injectors from MAN B&W, Wärtsilä and more.',
    h1: 'Marine main engine parts and spares',
    intro:
      'This category brings together spare parts for two-stroke and four-stroke propulsion engines: pistons and piston crowns, cylinder liners, cylinder heads, exhaust valves, connecting rods, crankshafts and main bearings, plus fuel injection equipment such as fuel pumps, injectors, nozzles and delivery valves. Listings cover engines from MAN B&W, Wärtsilä, Sulzer, Mitsubishi UEC, MaK, Daihatsu, Yanmar, Deutz and other makers, offered as new OEM, genuine surplus, reconditioned or used stock.\n\n' +
      'Before you commit, match the part number and engine type against your instruction manual, and ask the seller for nameplate photos, maker or class certificates and, for major components such as crankshafts, recent calibration or crack-test reports. For used items, request running hours and the reason for removal. Owners, managers and dealers holding surplus main engine spares can list them on MarineYard and reach buyers worldwide.',
  },
  'auxiliary-engines': {
    metaTitle: 'Auxiliary Engines, Gensets & Generator Spares | MarineYard',
    metaDescription:
      'Find marine auxiliary engines, diesel gensets, alternators and generator spare parts from sellers worldwide. Buy surplus stock or list your own spares.',
    h1: 'Auxiliary engines, generators and genset spares',
    intro:
      'Auxiliary diesel engines keep the electrical plant running at sea and in port, and this section covers both complete generating sets and the parts that keep them online. Typical listings include gensets and bare engines, alternators and AVRs, cylinder heads, pistons, liners, connecting rods, governors, fuel injection pumps and overhaul kits. Common makers include Yanmar, Daihatsu, Wärtsilä, MAN, Caterpillar, Cummins, MaK, Hyundai HiMSEN and Niigata, along with alternator brands such as Stamford, Leroy-Somer and Taiyo.\n\n' +
      'Check the engine model, serial number and output (kW, voltage and frequency) against your vessel\'s requirements, and confirm whether a genset comes with its alternator, control panel and base frame. Ask for running hours, load test records and any class documentation. If you have spare auxiliary engines or generator parts sitting in a store or warehouse, list them to reach buyers worldwide.',
  },
  turbochargers: {
    metaTitle: 'Marine Turbochargers & Turbo Parts for Sale | MarineYard',
    metaDescription:
      'Buy and sell marine turbochargers worldwide: complete turbos, cartridges, rotors, nozzle rings and bearings for ABB, MAN, Mitsubishi MET and Napier units.',
    h1: 'Marine turbochargers and turbo spares',
    intro:
      'Turbochargers are among the highest-value spares on any engine, and buyers often look for a complete unit or cartridge to cut downtime after a failure. This category lists complete turbochargers, cartridge groups, rotor shafts, nozzle rings, turbine blades, compressor wheels, bearings, seals and casings. You will find parts for ABB VTR, TPL and A100 series, MAN NR, TCR and TCA, Mitsubishi MET, Napier and KBB units fitted to both main and auxiliary engines.\n\n' +
      'Confirm the turbocharger type and serial number from the rating plate, because rotors and nozzle rings are often matched to a specific engine rating. Ask the seller for balancing reports, inspection or overhaul records, running hours since the last overhaul and clear photos of blades and journals. Workshops and owners with surplus turbochargers or spare rotors can list them to reach engine rooms and repair yards worldwide.',
  },
  'pumps-compressors': {
    metaTitle: 'Marine Pumps, Compressors & Hydraulics for Sale | MarineYard',
    metaDescription:
      'Source marine pumps, air and gas compressors and hydraulic units from sellers worldwide. Buy centrifugal and screw pumps or list your surplus equipment.',
    h1: 'Pumps, compressors and hydraulic equipment',
    intro:
      'From cooling water circulation to cargo discharge and starting air, pumps and compressors work around the clock on board. This category covers centrifugal, screw, gear and piston pumps, complete pump sets and spares such as impellers, mechanical seals, shafts and wear rings. It also includes starting and service air compressors, gas compressors for offshore and process duty, and hydraulic power packs, motors and cylinders. Common makers include Shinko, Naniwa, Taiko, Framo, IMO, Allweiler, Sperre, Tanabe, Hatlapa and Atlas Copco.\n\n' +
      'Buyers should confirm the model and serial number, capacity and head or pressure rating, motor voltage and frequency, and the materials of construction for the medium being handled. For used equipment, ask about running hours, overhaul history and any test certificates. If you hold surplus pumps, compressors or hydraulic units, list them to reach buyers worldwide.',
  },
  separators: {
    metaTitle: 'Marine Oil Separators & Purifiers for Sale | MarineYard',
    metaDescription:
      'Buy and sell fuel and lube oil separators, purifier bowls, disc stacks and service kits from Alfa Laval, GEA Westfalia and Mitsubishi. Sellers worldwide.',
    h1: 'Oil separators, purifiers and centrifuge spares',
    intro:
      'Centrifugal separators clean fuel and lubricating oil before it reaches the engine, so a reliable purifier plant is essential for safe operation. This category covers complete separators and purifiers, bowl assemblies, disc stacks, gravity discs, vertical and horizontal shafts, frame parts, gear sets, control units and the intermediate and major service kits needed for routine overhauls. Most listings are for Alfa Laval, GEA Westfalia, Mitsubishi Kakoki and Samgong machines.\n\n' +
      'Check the exact separator model and serial number, because bowl parts and kits are specific to each type and generation. For a complete machine, ask whether it comes with motor, starter and control panel, and request photos of the bowl and spindle, running hours and any balancing or overhaul records. Ship managers, workshops and dealers with surplus separator spares are welcome to list them for buyers worldwide.',
  },
  'boilers-heat-exchangers': {
    metaTitle: 'Marine Boilers, Burners & Heat Exchangers | MarineYard',
    metaDescription:
      'Find marine boilers, burners, economisers, plate heat exchangers, coolers and fresh water generators for sale from sellers worldwide. Buy or list spares.',
    h1: 'Boilers, heat exchangers and fresh water generators',
    intro:
      'Steam and thermal plant on a vessel covers much more than the boiler itself. This category includes auxiliary and composite boilers, exhaust gas economisers, burners and burner management parts, ignition components, safety valves and gauge glasses, alongside plate and shell-and-tube heat exchangers, central and lube oil coolers, plates and gaskets, and fresh water generators. Typical brands include Aalborg, Alfa Laval, Saacke, Weishaupt, Miura, Kangrim, Osaka Boiler, Sasakura and Atlas.\n\n' +
      'When buying, match the model and serial number and, for heat exchangers, the plate type, plate count and gasket material. Boiler and pressure parts usually need maker or class certificates, so ask the seller what documentation is available, along with photos and service history. Owners and suppliers with surplus boiler, cooler or fresh water generator equipment can list it here to reach marine buyers worldwide.',
  },
  'deck-machinery': {
    metaTitle: 'Deck Machinery, Winches & Marine Cranes | MarineYard',
    metaDescription:
      'Buy and sell deck machinery worldwide: mooring winches, windlasses, capstans, marine cranes, anchors and chain. Find surplus spares or list your equipment.',
    h1: 'Deck machinery, cranes, anchors and chains',
    intro:
      'Deck machinery handles mooring, anchoring and cargo work, and a breakdown can keep a vessel alongside longer than planned. This category covers mooring and towing winches, anchor windlasses, capstans, deck and provision cranes, davits, hydraulic motors and brakes, gearboxes and spare parts, as well as anchors, anchor chain, shackles and mooring fittings. Typical makers include MacGregor, Hatlapa, Kawasaki, IHI, TTS, Liebherr, NOV and Rolls-Royce Marine.\n\n' +
      'For machinery, confirm the model, rated pull or safe working load, drive type (electric or hydraulic) and the supply voltage or hydraulic pressure. Anchors and chain should come with class certificates showing grade, diameter and proof load, so ask for those along with photos and any inspection records. If you are holding surplus deck equipment, anchors or chain, list it to reach shipyards, owners and dealers worldwide.',
  },
  'navigation-communication': {
    metaTitle: 'Marine Navigation & Communication Equipment | MarineYard',
    metaDescription:
      'Buy and sell marine radar, ECDIS, GPS, gyrocompasses, autopilots, VHF and GMDSS equipment worldwide. Browse bridge electronics or list your surplus units.',
    h1: 'Marine navigation and communication equipment',
    intro:
      'Bridge electronics have to work on every watch and pass every survey. This category lists radars and scanners, ECDIS and chart systems, GPS and DGPS receivers, gyrocompasses and repeaters, autopilots, echo sounders, speed logs, AIS, VDR, VHF and MF/HF radios, Inmarsat terminals and other GMDSS equipment, plus spare boards, magnetrons and displays. Common brands include Furuno, JRC, Kongsberg, Sperry Marine, Raytheon Anschütz, Simrad, Sailor and Tokyo Keiki.\n\n' +
      'Check the model and the software or hardware version, since many units only work with matching sensors and processors. Ask whether type approval, wheelmark documents or a recent service report are available, and request photos of the label and serial number. Satellite terminals may also need to be re-registered before use. Dealers and owners with spare bridge equipment can list it to reach buyers worldwide.',
  },
  'electrical-automation': {
    metaTitle: 'Marine Electrical & Automation Spares for Sale | MarineYard',
    metaDescription:
      'Find marine switchboards, PLCs, sensors, electric motors, circuit breakers and control cards from sellers worldwide. Buy automation spares or list yours.',
    h1: 'Marine electrical and automation spares',
    intro:
      'Many electrical and automation faults come down to a single board or module, which is why obsolete control parts are some of the hardest items to find. This category covers main and emergency switchboard components, air circuit breakers, generator protection relays, PLCs and I/O modules, control and alarm cards, sensors and transmitters, electric motors, starters, transformers and cables. Makers frequently listed include ABB, Siemens, Schneider, Terasaki, Kongsberg, Lyngsø Marine, DEIF, Woodward, Mitsubishi and Omron.\n\n' +
      'Always quote the exact part number and revision printed on the module, as near-identical cards can differ in firmware or wiring. Ask the seller whether items are new in box, surplus or removed from service, whether they have been tested, and for photos of labels and packaging. Shipowners and dealers with surplus electrical and automation spares can list them for buyers worldwide.',
  },
  'propulsion-steering': {
    metaTitle: 'Propellers, Thrusters & Steering Gear for Sale | MarineYard',
    metaDescription:
      'Buy and sell marine propellers, shafts, bow and azimuth thrusters, reduction gearboxes and steering gear spares worldwide. List surplus propulsion parts.',
    h1: 'Propulsion and steering equipment',
    intro:
      'This category covers the equipment that turns engine power into thrust and keeps the vessel on course. Listings include fixed and controllable pitch propellers, propeller blades and hubs, intermediate and tail shafts, stern tube seals and bearings, couplings, reduction gearboxes and clutches, bow and stern tunnel thrusters, azimuth units, and steering gear with its rams, pumps and rudder parts. Common makers include Rolls-Royce, Schottel, Wärtsilä, Kawasaki, Nakashima, Reintjes, ZF and Hatlapa.\n\n' +
      'Propulsion parts are heavy and usually specific to one hull or engine, so check diameter, pitch, bore and keyway dimensions, gear ratio and power rating before you make an offer. Ask for class certificates, drawings, measurement records and recent photos. For used gear, find out why it was removed and when it was last overhauled. If you have surplus propellers, shafts or thruster parts, list them to reach buyers worldwide.',
  },
  'valves-pipes-fittings': {
    metaTitle: 'Marine Valves, Pipes & Fittings for Sale | MarineYard',
    metaDescription:
      'Buy and sell marine valves, pipes and fittings worldwide: butterfly, gate, globe and safety valves, flanges, actuators and fittings. List your surplus.',
    h1: 'Marine valves, pipes and fittings',
    intro:
      'Valves and pipework run through every system on a ship, from seawater cooling and ballast to fuel, steam and cargo lines. This category lists butterfly, gate, globe, ball and check valves, safety and relief valves, quick-closing and remote-operated valves, actuators and positioners, as well as flanges, pipe spools, couplings, expansion joints, hoses and fittings. Makers often seen here include KSB, Kitz, Tomoe, Keystone, Nakakita, Leser, Danfoss and Straub.\n\n' +
      'Check the size (DN or NPS), pressure rating, end connection standard (JIS, DIN or ANSI) and body and seal materials against your piping specification. For safety valves and items in class-approved systems, ask for material or test certificates and set-pressure records, and request photos of the body markings. Suppliers and owners with surplus valves, flanges and fittings can list them for buyers worldwide.',
  },
  'safety-lifesaving': {
    metaTitle: 'Marine Safety & Lifesaving Equipment for Sale | MarineYard',
    metaDescription:
      'Find lifeboats, liferafts, rescue boats, davits, fire fighting and LSA equipment from marine sellers worldwide. Buy safety gear or list your surplus units.',
    h1: 'Marine safety and lifesaving equipment',
    intro:
      'Lifesaving and fire fighting equipment is closely regulated, so buyers need both the right item and the paperwork that goes with it. This category includes lifeboats and rescue boats, davits and release gear, liferafts, lifebuoys and lifejackets, immersion suits, EPIRBs and SARTs, fire pumps, fixed CO2 and foam system parts, extinguishers, breathing apparatus and fireman\'s outfits. Common makers include Viking, Survitec, Fassmer, Hatecke, Palfinger, Dräger and Gloria.\n\n' +
      'Before buying, confirm SOLAS or flag approval, the wheelmark or type approval certificate, the date of manufacture and the date of the last service. Liferafts and other inflatable items must be serviced at an approved station, and some equipment has a limited service life. Ask for certificates and photos before you agree terms. Suppliers holding surplus safety and LSA equipment can list it to reach buyers worldwide.',
  },
  'hvac-refrigeration': {
    metaTitle: 'Marine HVAC & Refrigeration Spares for Sale | MarineYard',
    metaDescription:
      'Buy and sell marine HVAC and refrigeration spares worldwide: reefer and AC compressors, condensers, provision plant parts and controls. List your surplus.',
    h1: 'Marine HVAC and refrigeration spares',
    intro:
      'Air conditioning keeps accommodation and control rooms habitable, while provision and cargo refrigeration protects stores and reefer cargo. This category covers reciprocating and screw refrigeration compressors, condensers and evaporators, air handling units, fan coils, expansion valves, pressure switches and controllers, as well as spare parts for reefer containers. Common makers include Bitzer, Sabroe, Daikin, Carrier, Thermo King, Danfoss, Heinen & Hopman and Novenco.\n\n' +
      'Check the compressor model, refrigerant type, cooling capacity and electrical supply before buying, since many plants are being converted away from older refrigerants and parts are not always interchangeable. Ask whether used compressors have been pressure tested or overhauled, and request nameplate photos and running hours. Ship managers and dealers with surplus refrigeration and air conditioning spares can list them for buyers worldwide.',
  },
  'tools-workshop': {
    metaTitle: 'Marine Tools & Workshop Equipment for Sale | MarineYard',
    metaDescription:
      'Find hydraulic tools, torque wrenches, measuring instruments and workshop machines for ship engine rooms from sellers worldwide. Buy or list your tools.',
    h1: 'Marine tools and workshop equipment',
    intro:
      'Engine room maintenance depends on the right special tools, many of which are supplied with the engine and are hard to replace. This category covers hydraulic jacks and tensioning tools, hydraulic pumps and hoses, torque wrenches, lifting gear, valve grinding and seat cutting machines, liner and bearing measuring tools, micrometers, indicators and pressure gauges, as well as lathes, drilling machines and welding equipment for the ship\'s workshop. Tools from MAN B&W, Wärtsilä, Enerpac, Hytorc and Mitutoyo often appear here.\n\n' +
      'Check that hydraulic tools match your bolt size and working pressure, and that maker special tools fit your engine type. For measuring instruments and gauges, ask for a recent calibration certificate. Request photos of markings, seals and case contents. If you have surplus engine tools or workshop machines, list them to reach engine crews and repair shops worldwide.',
  },
  other: {
    metaTitle: 'Other Marine Equipment & Ship Spares for Sale | MarineYard',
    metaDescription:
      'Browse marine equipment and ship spares outside the main categories, from environmental systems to cargo gear and stores. Buy or sell them worldwide.',
    h1: 'Other marine equipment and ship spares',
    intro:
      'Not every part fits a neat heading. This category gathers the equipment and spares that keep a ship running but sit outside the main sections, such as oily water separators, sewage treatment plants, incinerators, ballast water treatment parts, scrubber components, cargo handling and hatch cover parts, galley and laundry machines, filters, gaskets, paints and general ship stores. Listings come from owners, ship chandlers, surplus dealers and recyclers around the world.\n\n' +
      'Because the range is so wide, give each enquiry plenty of detail: the maker, model, part number, quantity and where the item will be used. Ask the seller for photos, nameplates and any certificates, and check that environmental equipment carries the approvals your flag or class requires. If you have surplus equipment that does not belong elsewhere, list it here and let buyers worldwide find it.',
  },
}
