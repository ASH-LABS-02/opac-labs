export default function TrustIndicators() {
    const indicators = [
        "Tested components",
        "Beginner friendly kits", 
        "Projects designed for students",
        "Fast support"
    ];

    return (
        <div className="trust-indicators">
            <div className="container">
                <div className="trust-grid">
                    {indicators.map((indicator, index) => (
                        <div key={index} className="trust-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                            <span>{indicator}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}