#!/usr/bin/env python3
"""
Gera KMLs por dia do roteiro Fernanda & Isabella · Lago di Como · Jun 2026.

Ícones:
  - Atrações    → pino padrão do KML (sem ícone customizado)
  - Ferry/Pier  → Drive: estacao-ferry.png
  - Ônibus      → Drive: bus.png
  - Restaurante → Drive: restaurante.png
  - Sobremesa   → Drive: sobremesa.png
  - Bar/Drink   → Drive: drink.png
  - Hotel       → Drive: hotel.png
  - Aeroporto   → Drive: airport.png
"""

import time
import json
import urllib.request
import urllib.parse
import os
import sys

# ─── CAMINHOS ────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_FILE = os.path.join(SCRIPT_DIR, "coords_cache.json")

# ─── NOMINATIM ───────────────────────────────────────────────────────────────
USER_AGENT = "VamosCarimbar/1.0 roteiro@vamoscarimbar.com"
RATE_LIMIT  = 1.15  # segundos entre requests

# ─── BOUNDING BOXES ──────────────────────────────────────────────────────────
BB_COMO      = {"lat_min": 45.7,  "lat_max": 46.2,  "lon_min": 8.8,  "lon_max": 9.45}
BB_LOMBARDIA = {"lat_min": 44.8,  "lat_max": 46.7,  "lon_min": 7.5,  "lon_max": 11.5}

# ─── ÍCONES DRIVE ────────────────────────────────────────────────────────────
_BASE = "https://drive.usercontent.google.com/download?id={id}&amp;export=view"

ICONS = {
    "ferry":       _BASE.format(id="1Hmhf7S_xvZVO8R_yq5Fxwn3EdEKEwM1v"),
    "bus":         _BASE.format(id="1B8Ya1iC-ZY5N7K0kaMg_MRfy19Ym35BZ"),
    "restaurante": _BASE.format(id="17pfPQnqimy0c7eaiPRuCgLUC89VuvJq-"),
    "sobremesa":   _BASE.format(id="1RD80r8fkH7Ob84vl-HvS89SeWDlUpAoA"),
    "cafe":        _BASE.format(id="1oRe1CB5P96FygwoWFJJIYa_yPo2R5Ktr"),
    "drink":       _BASE.format(id="1epqZKoXjcnuBmgeNEn6TK9YmRvctNPiH"),
    "hotel":       _BASE.format(id="1FUQ0QRgf6CLFmX8SPVWHFs90Qct8faFA"),
    "airport":     _BASE.format(id="1exX-ZKbp-SbyK5uSr3ToOKkjrtYOG-Pc"),
}

# ─── CACHE PRÉ-SEMEADO (coords validadas visualmente) ────────────────────────
SEED_CACHE = {
    "Hotel Locanda La Pergola, Pescallo, Bellagio, Como, Italy|it":
        {"lat": 45.9860, "lon": 9.2645},
    "Imbarcadero di Bellagio, Bellagio, Como, Italy|it":
        {"lat": 45.9842, "lon": 9.2587},
    "Salita Serbelloni, Bellagio, Como, Italy|it":
        {"lat": 45.9855, "lon": 9.2620},
    "Centrinho di Bellagio, Bellagio, Como, Italy|it":
        {"lat": 45.9848, "lon": 9.2610},
    "Ristorante Bilacus, Bellagio, Como, Italy|it":
        {"lat": 45.9851, "lon": 9.2617},
    "Punta Spartivento, Bellagio, Como, Italy|it":
        {"lat": 45.9872, "lon": 9.2680},
    "Ristorante La Punta, Bellagio, Como, Italy|it":
        {"lat": 45.9909, "lon": 9.2645},
    "Villa Melzi, Bellagio, Como, Italy|it":
        {"lat": 45.9791, "lon": 9.2532},
    "Hotel Suisse Bellagio, Bellagio, Como, Italy|it":
        {"lat": 45.9870, "lon": 9.2608},
    "Imbarcadero Lenno, Lenno, Como, Italy|it":
        {"lat": 45.9691, "lon": 9.2184},
    "Piazza XI Febbraio, Lenno, Como, Italy|it":
        {"lat": 45.9691, "lon": 9.2184},
    "Lido di Lenno, Lenno, Como, Italy|it":
        {"lat": 45.9695, "lon": 9.2168},
    "Villa del Balbianello, Lenno, Como, Italy|it":
        {"lat": 45.9673, "lon": 9.2150},
    "SS. Stefano e Vincenzo, Lenno, Como, Italy|it":
        {"lat": 45.9692, "lon": 9.2178},
    "Via Adda, Cernobbio, Como, Italy|it":
        {"lat": 45.8447, "lon": 9.0778},
    "Villa d'Este, Cernobbio, Como, Italy|it":
        {"lat": 45.8449, "lon": 9.0798},
    "Imbarcadero di Varenna, Varenna, Lecco, Italy|it":
        {"lat": 46.0148, "lon": 9.2853},
    "Passeggiata degli Innamorati, Varenna, Lecco, Italy|it":
        {"lat": 46.0140, "lon": 9.2838},
    "Villa Cipressi, Varenna, Lecco, Italy|it":
        {"lat": 46.0130, "lon": 9.2855},
    "Villa Monastero, Varenna, Lecco, Italy|it":
        {"lat": 46.0122, "lon": 9.2858},
    "Piazza San Giorgio, Varenna, Lecco, Italy|it":
        {"lat": 46.0152, "lon": 9.2845},
    "Imbarcadero di Cadenabbia, Cadenabbia, Como, Italy|it":
        {"lat": 45.9981, "lon": 9.2147},
    "Villa Carlotta, Tremezzo, Como, Italy|it":
        {"lat": 46.0028, "lon": 9.2135},
    "Ristorante Azalea, Tremezzo, Como, Italy|it":
        {"lat": 46.0040, "lon": 9.2138},
    "Parco Civico Teresio Olivelli, Tremezzo, Como, Italy|it":
        {"lat": 46.0042, "lon": 9.2125},
    "Piazza Filzi, Tremezzo, Como, Italy|it":
        {"lat": 46.0040, "lon": 9.2130},
    "Grand Hotel Tremezzo, Tremezzo, Como, Italy|it":
        {"lat": 46.0072, "lon": 9.2134},
    "Aeroporto Malpensa, Varese, Italy|it":
        {"lat": 45.6301, "lon": 8.7231},
}

# ─── GEOCODIFICAÇÃO ──────────────────────────────────────────────────────────
_last_req = [0.0]

def load_cache():
    cache = dict(SEED_CACHE)
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, encoding="utf-8") as f:
            stored = json.load(f)
        cache.update(stored)
    return cache

def save_cache(cache):
    persistent = {k: v for k, v in cache.items() if k not in SEED_CACHE or v == "MANUAL_REVIEW"}
    if persistent:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(persistent, f, indent=2, ensure_ascii=False)

def _nominatim(query, countrycodes):
    params = {"q": query, "format": "json", "limit": 1, "countrycodes": countrycodes}
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(params)
    elapsed = time.time() - _last_req[0]
    if elapsed < RATE_LIMIT:
        time.sleep(RATE_LIMIT - elapsed)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            data = json.loads(r.read().decode())
    except Exception as e:
        print(f"    [ERR] {e}", file=sys.stderr)
        data = []
    _last_req[0] = time.time()
    return data

def _in_box(lat, lon, bb):
    return bb["lat_min"] <= lat <= bb["lat_max"] and bb["lon_min"] <= lon <= bb["lon_max"]

def geocode(label, query, bbox, cache, cc="it"):
    key = f"{query}|{cc}"
    if key in cache:
        if cache[key] == "MANUAL_REVIEW":
            print(f"  [SKIP] {label} — MANUAL_REVIEW")
            return None
        c = cache[key]
        print(f"  [OK]   {label} → {c['lat']:.4f},{c['lon']:.4f}")
        return c

    print(f"  [GEO]  {label}: {query}")
    results = _nominatim(query, cc)

    for r in results:
        lat, lon = float(r["lat"]), float(r["lon"])
        if _in_box(lat, lon, bbox):
            coord = {"lat": lat, "lon": lon}
            print(f"         → {lat:.4f},{lon:.4f}  ({r.get('display_name','')[:60]})")
            cache[key] = coord
            return coord

    parts = [p.strip() for p in query.split(",")]
    if len(parts) >= 3:
        fallback = ", ".join(parts[-3:])
        print(f"  [FB]   {fallback}")
        results2 = _nominatim(fallback, cc)
        for r in results2:
            lat, lon = float(r["lat"]), float(r["lon"])
            if _in_box(lat, lon, bbox):
                coord = {"lat": lat, "lon": lon, "fallback": True}
                print(f"         → {lat:.4f},{lon:.4f} FALLBACK")
                cache[key] = coord
                return coord

    print(f"  [!!!]  MANUAL_REVIEW: {label}", file=sys.stderr)
    cache[key] = "MANUAL_REVIEW"
    return None

# ─── GERAÇÃO KML ─────────────────────────────────────────────────────────────
def _style_block(style_id, icon_key):
    if icon_key is None:
        return (
            f'  <Style id="{style_id}">\n'
            f'    <LabelStyle><scale>0.9</scale></LabelStyle>\n'
            f'  </Style>'
        )
    url = ICONS[icon_key]
    return (
        f'  <Style id="{style_id}">\n'
        f'    <IconStyle>\n'
        f'      <scale>1.2</scale>\n'
        f'      <Icon><href>{url}</href></Icon>\n'
        f'      <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>\n'
        f'    </IconStyle>\n'
        f'    <LabelStyle><scale>0.9</scale></LabelStyle>\n'
        f'  </Style>'
    )

def _pm(name, lon, lat, style_id):
    safe = name.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return (
        f'  <Placemark>\n'
        f'    <name>{safe}</name>\n'
        f'    <styleUrl>#{style_id}</styleUrl>\n'
        f'    <Point><coordinates>{lon},{lat},0</coordinates></Point>\n'
        f'  </Placemark>'
    )

def _safe_xml(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def write_kml(filepath, doc_name, points, cache):
    styles_done = {}
    style_blocks = []
    pm_blocks = []

    for p in points:
        coord = geocode(p["name"], p["query"], p["bbox"], cache, p.get("cc", "it"))
        if coord is None:
            continue
        ik = p.get("icon")
        sid = f"s_{ik or 'default'}"
        if sid not in styles_done:
            style_blocks.append(_style_block(sid, ik))
            styles_done[sid] = True
        pm_blocks.append(_pm(p["name"], coord["lon"], coord["lat"], sid))

    kml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<kml xmlns="http://www.opengis.net/kml/2.2">\n'
        '<Document>\n'
        f'  <name>{_safe_xml(doc_name)}</name>\n\n'
        + "\n".join(style_blocks)
        + "\n\n"
        + "\n".join(pm_blocks)
        + "\n\n</Document>\n</kml>\n"
    )
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(kml)
    print(f"  → Salvo: {os.path.basename(filepath)}")

# ─── DEFINIÇÃO DOS PONTOS POR DIA ────────────────────────────────────────────

def main():
    cache = load_cache()

    # ── INFRAESTRUTURA ──────────────────────────────────────────────────────
    print("\n=== INFRAESTRUTURA ===")
    write_kml(
        os.path.join(SCRIPT_DIR, "00-infraestrutura.kml"),
        "Fernanda & Isabella · Infraestrutura",
        [
            {"name": "— Aeroporto Malpensa (MXP)",
             "query": "Aeroporto Malpensa, Varese, Italy",
             "bbox": BB_LOMBARDIA, "icon": "airport"},
            {"name": "— Hotel Locanda La Pergola · Pescallo · Bellagio",
             "query": "Hotel Locanda La Pergola, Pescallo, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": "hotel"},
        ],
        cache,
    )

    # ── DIA 01 — 27/06 · Chegada + Bellagio ─────────────────────────────────
    print("\n=== DIA 01 — Chegada + Bellagio ===")
    write_kml(
        os.path.join(SCRIPT_DIR, "dia01.kml"),
        "Fernanda & Isabella · DIA 01 — Chegada + Bellagio",
        [
            {"name": "— Porto di Bellagio · Piazza Mazzini",
             "query": "Imbarcadero di Bellagio, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": "ferry"},
            {"name": "— Salita Serbelloni · Bellagio",
             "query": "Salita Serbelloni, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Ruelas medievais · Centrinho de Bellagio",
             "query": "Centrinho di Bellagio, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Ristorante Bilacus · Almoço 13h",
             "query": "Ristorante Bilacus, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": "restaurante"},
            {"name": "— Gelateria del Borgo · Sobremesa",
             "query": "Gelateria del Borgo, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": "sobremesa"},
            {"name": "— Pier Hotel La Pergola · Saída Barco Privado 16h",
             "query": "Hotel Locanda La Pergola, Pescallo, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": "ferry"},
            {"name": "— Hotel Florence · Bar 20h",
             "query": "Hotel Florence, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": "drink"},
            {"name": "— Ristorante Barchetta · Jantar 22h",
             "query": "Ristorante Barchetta, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": "restaurante"},
        ],
        cache,
    )

    # ── DIA 02 — 28/06 · Lenno · Balbianello · Cernobbio ────────────────────
    print("\n=== DIA 02 — Lenno · Balbianello · Cernobbio ===")
    write_kml(
        os.path.join(SCRIPT_DIR, "dia02.kml"),
        "Fernanda & Isabella · DIA 02 — Lenno · Balbianello · Cernobbio",
        [
            {"name": "— Porto di Bellagio (saída ferry 8h20)",
             "query": "Imbarcadero di Bellagio, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": "ferry"},
            {"name": "— Porto di Lenno · Piazza XI Febbraio (desembarque 8h35)",
             "query": "Piazza XI Febbraio, Lenno, Como, Italy",
             "bbox": BB_COMO, "icon": "ferry"},
            {"name": "— Lido di Lenno · Taxi Boat Shuttle → Balbianello (9h)",
             "query": "Lido di Lenno, Lenno, Como, Italy",
             "bbox": BB_COMO, "icon": "ferry"},
            {"name": "— Villa del Balbianello",
             "query": "Villa del Balbianello, Lenno, Como, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Centrinho de Lenno · Almoço walk-in 12h30",
             "query": "Piazza XI Febbraio, Lenno, Como, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Ponto Ônibus Lenno · Igreja (C10 → Cernobbio) 13h30",
             "query": "SS. Stefano e Vincenzo, Lenno, Como, Italy",
             "bbox": BB_COMO, "icon": "bus"},
            {"name": "— Ponto Ônibus Cernobbio · Via Adda (chegada C10)",
             "query": "Via Adda, Cernobbio, Como, Italy",
             "bbox": BB_COMO, "icon": "bus"},
            {"name": "— Villa d'Este · Bar Canova · 15h",
             "query": "Villa d'Este, Cernobbio, Como, Italy",
             "bbox": BB_COMO, "icon": "drink"},
            {"name": "— Ponto Ônibus Cernobbio · Via Adda (C10 volta 17h36 ou 18h36)",
             "query": "Via Adda, Cernobbio, Como, Italy",
             "bbox": BB_COMO, "icon": "bus"},
            {"name": "— Pier Lenno → Bellagio (ferry 20h05)",
             "query": "Imbarcadero Lenno, Lenno, Como, Italy",
             "bbox": BB_COMO, "icon": "ferry"},
            {"name": "— Punta Spartivento · Bellagio (20h30)",
             "query": "Punta Spartivento, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Ristorante La Punta · Jantar 22h",
             "query": "Ristorante La Punta, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": "restaurante"},
        ],
        cache,
    )

    # ── DIA 03 — 29/06 · Varenna ─────────────────────────────────────────────
    print("\n=== DIA 03 — Varenna ===")
    write_kml(
        os.path.join(SCRIPT_DIR, "dia03.kml"),
        "Fernanda & Isabella · DIA 03 — Varenna",
        [
            {"name": "— Porto di Bellagio (ferry 8h10 ou 9h10 → Varenna)",
             "query": "Imbarcadero di Bellagio, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": "ferry"},
            {"name": "— Porto di Varenna (desembarque)",
             "query": "Imbarcadero di Varenna, Varenna, Lecco, Italy",
             "bbox": BB_COMO, "icon": "ferry"},
            {"name": "— Villa Cipressi · Varenna",
             "query": "Villa Cipressi, Varenna, Lecco, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Villa Monastero · O Loggiato",
             "query": "Villa Monastero, Varenna, Lecco, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Bar Il Molo · Almoço 12h",
             "query": "Bar Il Molo, Varenna, Lecco, Italy",
             "bbox": BB_COMO, "icon": "restaurante"},
            {"name": "— Passeggiata degli Innamorati",
             "query": "Passeggiata degli Innamorati, Varenna, Lecco, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Riva Grande · Varenna",
             "query": "Piazza San Giorgio, Varenna, Lecco, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Piazza San Giorgio · Igreja de San Giorgio",
             "query": "Piazza San Giorgio, Varenna, Lecco, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Porto di Varenna (volta 18h45 ou 19h08 → Bellagio)",
             "query": "Imbarcadero di Varenna, Varenna, Lecco, Italy",
             "bbox": BB_COMO, "icon": "ferry"},
            {"name": "— Hotel Suisse Bellagio · Jantar 20h",
             "query": "Hotel Suisse Bellagio, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": "restaurante"},
        ],
        cache,
    )

    # ── DIA 04 — 30/06 · Tremezzo · Villa Carlotta ───────────────────────────
    print("\n=== DIA 04 — Tremezzo · Villa Carlotta ===")
    write_kml(
        os.path.join(SCRIPT_DIR, "dia04.kml"),
        "Fernanda & Isabella · DIA 04 — Tremezzo · Villa Carlotta",
        [
            {"name": "— Porto di Bellagio (ferry 8h20 → Tremezzo)",
             "query": "Imbarcadero di Bellagio, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": "ferry"},
            {"name": "— Pier Tremezzo (desembarque 8h50)",
             "query": "Imbarcadero di Cadenabbia, Cadenabbia, Como, Italy",
             "bbox": BB_COMO, "icon": "ferry"},
            {"name": "— Villa Carlotta · 10h",
             "query": "Villa Carlotta, Tremezzo, Como, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Chiosco Villa Carlotta · Almoço 13h",
             "query": "Villa Carlotta, Tremezzo, Como, Italy",
             "bbox": BB_COMO, "icon": "restaurante"},
            {"name": "— Centrinho de Tremezzo · Parco Olivelli",
             "query": "Parco Civico Teresio Olivelli, Tremezzo, Como, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Lungolago di Tremezzo · Piazza Filzi",
             "query": "Piazza Filzi, Tremezzo, Como, Italy",
             "bbox": BB_COMO, "icon": None},
            {"name": "— Grand Hotel Tremezzo · Da Giacomo al Lago · 15h",
             "query": "Grand Hotel Tremezzo, Tremezzo, Como, Italy",
             "bbox": BB_COMO, "icon": "restaurante"},
            {"name": "— Pier Tremezzo → Bellagio (saída 17h12)",
             "query": "Imbarcadero di Cadenabbia, Cadenabbia, Como, Italy",
             "bbox": BB_COMO, "icon": "ferry"},
            {"name": "— Villa Melzi · Bellagio 18h",
             "query": "Villa Melzi, Bellagio, Como, Italy",
             "bbox": BB_COMO, "icon": None},
        ],
        cache,
    )

    save_cache(cache)
    print("\n✅ Todos os KMLs gerados com sucesso!")
    print(f"   Pasta: {SCRIPT_DIR}")


if __name__ == "__main__":
    main()
