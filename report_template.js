/**
 * Exportiert die HTML-Vorlage für den Einsatzbericht.
 * Dies ist eine separate Datei, um die Haupt-app.js übersichtlich zu halten.
 *
 * @param {object} data - Die Daten, die zum Rendern des Berichts benötigt werden (Zahlen, Listen, etc.).
 * @returns {string} Der komplette HTML-Inhalt des Berichts.
 */
export function getReportHtmlTemplate(data) {
    const { 
        reportDate, lagezeichner, 
        openCount, dispatchedCount, completedCount, totalCount, 
        allSectionsArray, sectionsHtml, incidentsHtml, keywordHtml 
    } = data;

    // FIX: Escaped backticks in the JS template to ensure they don't interfere with the main template literal
    const escapedMapPopup = (sectionName, responsible) => 
        `<b>EA: ${sectionName}</b><br>Verantwortlich: ${responsible}`;
    const escapedMapTooltip = (sectionColor, sectionName) => 
        `<span style="color: ${sectionColor}; font-weight: bold; font-size: 14px; text-shadow: -1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF, 0 0 4px #FFF;">${sectionName}</span>`;
    const escapedMapIncidentPopup = (keyword, address, statusText, sectionName) =>
        `<b>${keyword}</b><br>${address}<br>Status: ${statusText}<br>EA: ${sectionName}`;

    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Einsatzprotokoll - ${reportDate}</title>
    <script src="https://cdn.tailwindcss.com"><\/script> 
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        @media print {
            .no-print { display: none !important; }
            #report-map { height: 70vh !important; }
        }
        .ea-label {
            background-color: transparent;
            border: none;
            box-shadow: none;
        }
    </style>
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        
        <!-- Header -->
        <div class="mb-6 pb-4 border-b border-gray-300">
            <h1 class="text-4xl font-bold text-red-700">Einsatzprotokoll</h1>
            <div class="mt-2 text-lg text-gray-700">
                <p><strong>Lagezeichner:</strong> ${lagezeichner}</p>
                <p><strong>Berichtsdatum:</strong> ${reportDate}</p>
            </div>
            <button onclick="window.print()" class="no-print mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150">
                Bericht drucken
            </button>
        </div>

        <!-- Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="p-4 bg-gray-50 rounded-lg border">
                <h2 class="text-sm font-bold text-gray-600 uppercase">Einsätze Gesamt</h2>
                <p class="text-3xl font-bold text-gray-900">${totalCount}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg border">
                <h2 class="text-sm font-bold text-gray-600 uppercase">Details</h2>
                <p class="text-base font-medium text-red-600">Offen: ${openCount}</p>
                <p class="text-base font-medium text-blue-600">Entsandt: ${dispatchedCount}</p>
                <p class="text-base font-medium text-amber-600">Abgeschlossen: ${completedCount}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg border">
                <h2 class="text-sm font-bold text-gray-600 uppercase">Einsatzabschnitte</h2>
                <p class="text-3xl font-bold text-indigo-700">${allSectionsArray.length}</p>
            </div>
        </div>

        <!-- Map & EA List -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div class="lg:col-span-2">
                <h2 class="text-2xl font-bold text-gray-800 mb-3">Lagekarte</h2>
                <div id="report-map" class="w-full h-[500px] rounded-lg border border-gray-300"></div>
            </div>
            <div>
                <h2 class="text-2xl font-bold text-gray-800 mb-3">Einsatzabschnitte</h2>
                <ul class="space-y-2">
                    ${sectionsHtml}
                </ul>

                <!-- NEW: Keyword List -->
                <h2 class="text-2xl font-bold text-gray-800 mb-3 mt-6">Stichwort-Häufigkeit</h2>
                <div class="max-h-60 overflow-y-auto pr-2 border rounded p-2 bg-gray-50">
                    ${keywordHtml}
                </div>
                <!-- END NEW: Keyword List -->
            </div>
        </div>

        <!-- Incident List -->
        <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Einsatzliste (Neueste zuerst)</h2>
            <div class="space-y-4">
                ${incidentsHtml}
            </div>
        </div>

    </div>

    <script>
        // --- Embedded Data ---
        const allIncidents = ${JSON.stringify(data.allIncidentsArray)};
        const allSections = ${JSON.stringify(data.allSectionsArray)};

        // --- Helper Functions (Copied from main app logic) ---
        function getStatusColor(status) {
            if (status === 'open') return 'red';
            if (status === 'dispatched') return 'blue';
            if (status === 'completed') return 'amber'; 
            return 'grey';
        }

        function getGermanStatusText(status) {
            if (status === 'open') return 'OFFEN';
            if (status === 'dispatched') return 'ENTSANDT';
            if (status === 'completed') return 'ABGESCHLOSSEN';
            return 'UNBEKANNT';
        }
        
        function createMarkerIcon(color) {
            const hexColor = {
                'red': '#ef4444', 
                'blue': '#3b82f6', 
                'amber': '#f59e0b',
                'grey': '#6b7280'
            }[color];
            const svgIcon = \`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="\${hexColor}" width="36px" height="36px">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>\`;
            return L.divIcon({
                html: svgIcon,
                className: '',
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -36]
            });
        }

        // --- Map Initialization ---
        window.onload = () => {
            const map = L.map('report-map').setView([49.123, 8.404], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            const featureGroup = L.featureGroup().addTo(map);

            // Add Section Polygons
            allSections.forEach(section => {
                if (section.boundary && section.boundary.length >= 3) {
                    const sectionColor = section.color || '#4f46e5'; 
                    const polygon = L.polygon(section.boundary, {
                        color: sectionColor, 
                        fillColor: sectionColor, 
                        fillOpacity: 0.2, 
                        weight: 2
                    }).addTo(featureGroup);
                     
                    polygon.bindPopup(\`<b>EA: \${section.name}</b><br>Verantwortlich: \${section.responsible}\`);
                    
                    polygon.bindTooltip(
                        \`<span style="color: \${sectionColor}; font-weight: bold; font-size: 14px; text-shadow: -1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF, 0 0 4px #FFF;">\${section.name}</span>\`, {
                            permanent: true,
                            direction: 'center',
                            className: 'ea-label',
                            interactive: false
                        }
                    );
                }
            });

            // Add Incident Markers
            allIncidents.forEach(incident => {
                if (incident.lat && incident.lon) {
                    const color = getStatusColor(incident.status);
                    const icon = createMarkerIcon(color);
                    const statusText = getGermanStatusText(incident.status);
                    const section = incident.sectionId ? allSections.find(s => s.id === incident.sectionId) : null;
                    const sectionName = section ? section.name : (incident.status === 'completed' ? 'N/A (Abgeschl.)' : 'Kein EA');
                     
                    const popupContent = \`<b>\${incident.keyword}</b><br>\${incident.formattedAddress}<br>Status: \${statusText}<br>EA: \${sectionName}\`;
                    
                    const marker = L.marker([incident.lat, incident.lon], { icon: icon })
                        .addTo(featureGroup)
                        .bindPopup(popupContent);
                }
            });

            // Fit map to show all items
            if (featureGroup.getLayers().length > 0) {
                map.fitBounds(featureGroup.getBounds().pad(0.1));
            } else {
                map.setView([49.123, 8.404], 13);
            }
            
            setTimeout(function() {
                map.invalidateSize();
            }, 100);
        };
    <\/script> 
</body>
</html>
    `;
}
