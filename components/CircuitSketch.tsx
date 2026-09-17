import styles from '@/app/home.module.css';

/** Static, resolution-independent diagram: no image download or animation loop. */
export default function CircuitSketch() {
    return (
        <div className={styles.sketch}>
            <svg viewBox="0 0 520 470" role="img" aria-labelledby="circuit-title circuit-desc">
                <title id="circuit-title">From a sensor to a connected project</title>
                <desc id="circuit-desc">A sensor, code, and wireless connection linked to an ESP32 microcontroller.</desc>
                <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
                    <path d="M133 118h36v104h37m-73-94h26v105h47M286 208V96h66m-54 112V108h54M310 300h44v33h26m-70-21h32v34h38" />
                    <rect x="25" y="30" width="110" height="120" fill="#f9f5ef" />
                    <rect x="353" y="23" width="140" height="122" fill="#f9f5ef" />
                    <rect x="374" y="291" width="119" height="99" fill="#f9f5ef" />
                    <rect x="206" y="181" width="104" height="194" rx="9" fill="#ffe87a" />
                    <rect x="228" y="211" width="60" height="83" fill="#f9f5ef" />
                    <path d="M225 326h21v17h-21zM268 326h18v17h-18zM247 361v20h24v-20zM76 110v22m12-22v22M65 94v-9a18 18 0 0 1 36 0v9M59 95h48v14H59z" />
                    <path d="M371 59h103v61H371zM378 66h89v47h-89zM371 120l-14 12h130l-13-12M411 81l-9 8 9 8m23-16 9 8-9 8m-9-18-5 22" />
                    <path d="M396 344q37-35 74 0m-63 12q26-24 52 0m-40 11q14-12 27 0" />
                    <circle cx="432" cy="378" r="2" fill="currentColor" />
                    {[0,1,2,3,4,5,6,7,8].map(i => <g key={i}><rect x="212" y={211+i*15} width="6" height="7" rx="1" /><rect x="297" y={211+i*15} width="6" height="7" rx="1" /></g>)}
                    {[0,1,2,3,4].map(i => <path key={i} d={`M${236+i*10} 206v5m0 83v6`} />)}
                    <circle cx="217" cy="193" r="4" /><circle cx="299" cy="193" r="4" />
                    <circle cx="217" cy="363" r="4" /><circle cx="299" cy="363" r="4" />
                    <path d="M81 384l-10-10m3 29-14-2m25 19-11 8M98 443l132-20" />
                </g>
                <g fill="currentColor" className={styles.diagramLabels}>
                    <text x="42" y="54">SENSOR</text><text x="368" y="48">CODE</text><text x="390" y="315">CONNECT</text>
                    <text x="235" y="262" fontSize="16">ESP32</text>
                </g>
                <g fill="currentColor" className={styles.handwriting}>
                    <text x="29" y="177">Sense. Measure.</text><text x="29" y="197">Real-world data.</text>
                    <text x="365" y="170">Build. Deploy.</text><text x="365" y="190">Make it real.</text>
                    <text x="379" y="418">Wi-Fi + Bluetooth</text>
                    <text x="96" y="403" transform="rotate(-6 96 403)">Small ideas.</text>
                    <text x="96" y="426" transform="rotate(-6 96 426)">Big possibilities.</text>
                </g>
            </svg>
        </div>
    );
}
