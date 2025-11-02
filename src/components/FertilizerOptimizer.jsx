import React, { useState, useEffect } from 'react';
import { mlService } from '../services/mlService';
import './FertilizerOptimizer.css';
import axios from 'axios';

const FertilizerOptimizer = ({ onClose = null }) => {
    const [step, setStep] = useState('input');
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Available crops and soils from ML model
    const [availableCrops, setAvailableCrops] = useState([]);
    const [availableSoils, setAvailableSoils] = useState([]);

    // Input state
    const [selectedCrop, setSelectedCrop] = useState('');
    const [selectedSoil, setSelectedSoil] = useState('');
    const [landSize, setLandSize] = useState('');
    const [hasSoilTest, setHasSoilTest] = useState(false);
    const [soilNitrogen, setSoilNitrogen] = useState('');
    const [soilPhosphorous, setSoilPhosphorous] = useState('');
    const [soilPotassium, setSoilPotassium] = useState('');

    // Prediction result
    const [prediction, setPrediction] = useState(null);

    // Crop name mappings (English to Urdu)
    const cropNamesUrdu = {
        'Wheat': 'گندم',
        'Rice': 'چاول',
        'Cotton': 'کپاس',
        'Sugarcane': 'گنا',
        'Maize': 'مکئی',
        'Barley': 'جو',
        'Millets': 'باجرہ',
        'Ground Nuts': 'مونگ پھلی',
        'Oil seeds': 'تیل کے بیج',
        'Paddy': 'دھان',
        'Pulses': 'دالیں',
        'Tobacco': 'تمباکو',
    };

    // Complete soil type mappings (from Kaggle dataset)
    const soilNamesUrdu = {
        'Loamy': 'زرخیز مٹی',
        'Sandy': 'ریتلی مٹی',
        'Clayey': 'چکنی مٹی',
        'Black': 'کالی مٹی',
        'Red': 'سرخ مٹی',
    };

    // Complete fertilizer name mappings (from Kaggle dataset)
    const fertilizerNamesUrdu = {
        'Urea': 'یوریا',
        'DAP': 'ڈی اے پی',
        '28-28': '28-28 کھاد',
        '14-35-14': '14-35-14 کھاد',
        '17-17-17': '17-17-17 کھاد',
        '20-20': '20-20 کھاد',
        '10-26-26': '10-26-26 کھاد',
    };
    const getTranslatedCropName = (englishName) => {
        return language === 'ur'
            ? (cropNamesUrdu[englishName] || englishName)
            : englishName;
    };

    const getTranslatedSoilName = (englishName) => {
        return language === 'ur'
            ? (soilNamesUrdu[englishName] || englishName)
            : englishName;
    };

    const getTranslatedFertilizerName = (englishName) => {
        return language === 'ur'
            ? (fertilizerNamesUrdu[englishName] || englishName)
            : englishName;
    };
    useEffect(() => {
        loadSupportedOptions();
    }, []);
    const [audioUnlocked, setAudioUnlocked] = useState(false);

    // Unlock audio on first user click
    useEffect(() => {
        const unlockAudio = () => {
            const audio = new Audio();
            audio.play().catch(() => { });
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
            setAudioUnlocked(true);
        };

        if (!audioUnlocked) {
            document.addEventListener('click', unlockAudio);
            document.addEventListener('touchstart', unlockAudio);
        }

        return () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
    }, [audioUnlocked]);
    const loadSupportedOptions = async () => {
        const crops = await mlService.getSupportedCrops();
        const soils = await mlService.getSupportedSoils();
        setAvailableCrops(crops);
        setAvailableSoils(soils);
    };

    const handleGetRecommendation = async () => {
        if (!selectedCrop || !selectedSoil || !landSize) {
            setError(language === 'en' ? 'Please fill all required fields' : 'براہ کرم تمام ضروری معلومات درج کریں');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const requestData = {
                crop_type: selectedCrop,
                soil_type: selectedSoil,
                nitrogen: hasSoilTest && soilNitrogen ? parseFloat(soilNitrogen) : 40,
                phosphorous: hasSoilTest && soilPhosphorous ? parseFloat(soilPhosphorous) : 20,
                potassium: hasSoilTest && soilPotassium ? parseFloat(soilPotassium) : 150,
                temperature: 25,
                humidity: 70,
                moisture: 50,
            };

            const result = await mlService.predictFertilizer(requestData);

            // Add land size and cost calculations
            result.landSize = parseFloat(landSize);
            result.quantity = calculateQuantity(result.recommended_fertilizer, result.landSize);
            result.estimatedCost = calculateCost(result.recommended_fertilizer, result.quantity);

            setPrediction(result);
            setStep('recommendation');
        } catch (err) {
            setError(err.message || (language === 'en' ? 'Failed to get recommendation' : 'سفارش حاصل کرنے میں ناکامی'));
        } finally {
            setLoading(false);
        }
    };

    const calculateQuantity = (fertilizer, landSize) => {
        const baseQuantities = {
            'Urea': 50,
            'DAP': 45,
            '28-28': 40,
            '10-26-26': 50,
            '20-20': 45,
            '17-17-17': 48,
        };

        for (const [key, value] of Object.entries(baseQuantities)) {
            if (fertilizer.includes(key)) {
                return value * landSize;
            }
        }
        return 50 * landSize;
    };

    const calculateCost = (fertilizer, quantity) => {
        const pricesPerKg = {
            'Urea': 80,
            'DAP': 240,
            '28-28': 180,
            '10-26-26': 200,
            '20-20': 150,
            '17-17-17': 170,
        };

        for (const [key, value] of Object.entries(pricesPerKg)) {
            if (fertilizer.includes(key)) {
                return Math.round(value * quantity);
            }
        }
        return Math.round(100 * quantity);
    };

    const getFertilizerNameUrdu = (name) => {
        for (const [key, value] of Object.entries(fertilizerNamesUrdu)) {
            if (name.includes(key)) {
                return value;
            }
        }
        return name;
    };

    const handleReset = () => {
        setStep('input');
        setSelectedCrop('');
        setSelectedSoil('');
        setLandSize('');
        setHasSoilTest(false);
        setSoilNitrogen('');
        setSoilPhosphorous('');
        setSoilPotassium('');
        setPrediction(null);
        setError(null);
    };
    // Add your API key (use env var in production: process.env.REACT_APP_SPEECHMATICS_KEY)
    const SPEECHMATICS_KEY = 'your-api-key-here';  // Replace with your key
    const DATACENTER = 'us-east';  // Your datacenter

    const handleSpeak = async () => {
        if (!audioUnlocked) {
            alert('Please tap anywhere to enable sound.');
            return;
        }

        const fertilizer = getTranslatedFertilizerName(prediction.recommended_fertilizer);
        const text = language === 'en'
            ? `${prediction.recommended_fertilizer}, ${prediction.quantity} kg, ${prediction.landSize} acres, ${prediction.estimatedCost} rupees`
            : `${fertilizer}، ${prediction.quantity} کلو، ${prediction.landSize} ایکڑ، ${prediction.estimatedCost} روپے`;

        try {
            // Speechmatics TTS API call
            const response = await axios.post(
                `https://${DATACENTER}.tts.speechmatics.com/v2.0/tts`,
                {
                    text: text,
                    language: language === 'en' ? 'en-US' : 'ur-PK',
                    voice: language === 'en' ? 'en-US-John' : 'ur-PK-Ayesha',  // Urdu voice: Ayesha (female, natural)
                    format: 'mp3',  // Or 'wav'
                    sample_rate: 22050
                },
                {
                    headers: {
                        'Authorization': `Bearer ${SPEECHMATICS_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'blob'  // For audio blob
                }
            );

            // Create audio from blob
            const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play().catch(() => alert('Audio play failed. Check console.'));
        } catch (err) {
            console.error('Speechmatics error:', err);
            alert('TTS failed. Check API key or internet.');
        }
    };

    return (
        <div className="fertilizer-optimizer">
            <div className="optimizer-header">
                <h2>
                    {language === 'en' ? 'AI-Powered Fertilizer Optimizer' : 'AI سے کھاد کا بہترین استعمال'}
                </h2>
                <div className="header-actions">
                    <button
                        className="language-toggle"
                        onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
                    >
                        {language === 'en' ? 'اردو' : 'English'}
                    </button>
                    {onClose && <button className="close-btn" onClick={onClose}>×</button>}
                </div>
            </div>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {step === 'input' && (
                <div className="input-section">
                    <div className="form-group">
                        <label>{language === 'en' ? 'Select Crop' : 'فصل منتخب کریں'} *</label>
                        {/* Crop Dropdown */}
                        <select
                            value={selectedCrop}
                            onChange={(e) => setSelectedCrop(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">
                                {language === 'en' ? 'Choose a crop...' : 'فصل منتخب کریں...'}
                            </option>
                            {availableCrops.map(crop => (
                                <option key={crop} value={crop}>
                                    {getTranslatedCropName(crop)}
                                </option>
                            ))}
                        </select>
                        <br />
                        <br />

                        {/* Soil Dropdown */}
                        <select
                            value={selectedSoil}
                            onChange={(e) => setSelectedSoil(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">
                                {language === 'en' ? 'Choose soil type...' : 'مٹی کی قسم منتخب کریں...'}
                            </option>
                            {availableSoils.map(soil => (
                                <option key={soil} value={soil}>
                                    {getTranslatedSoilName(soil)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{language === 'en' ? 'Land Size (Acres)' : 'زمین کا رقبہ (ایکڑ)'} *</label>
                        <input
                            type="number"
                            value={landSize}
                            onChange={(e) => setLandSize(e.target.value)}
                            placeholder={language === 'en' ? 'Enter land size' : 'رقبہ درج کریں'}
                            disabled={loading}
                            min="0"
                            step="0.1"
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={hasSoilTest}
                                onChange={(e) => setHasSoilTest(e.target.checked)}
                            />
                            <span>
                                {language === 'en'
                                    ? 'I have soil test report'
                                    : 'میرے پاس مٹی کی جانچ رپورٹ ہے'}
                            </span>
                        </label>
                    </div>

                    {hasSoilTest && (
                        <div className="soil-test-inputs">
                            <div className="form-group">
                                <label>
                                    {language === 'en' ? 'Nitrogen (N) - mg/kg' : 'نائٹروجن (N)'}
                                </label>
                                <input
                                    type="number"
                                    value={soilNitrogen}
                                    onChange={(e) => setSoilNitrogen(e.target.value)}
                                    placeholder="e.g., 40"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    {language === 'en' ? 'Phosphorous (P) - mg/kg' : 'فاسفورس (P)'}
                                </label>
                                <input
                                    type="number"
                                    value={soilPhosphorous}
                                    onChange={(e) => setSoilPhosphorous(e.target.value)}
                                    placeholder="e.g., 20"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    {language === 'en' ? 'Potassium (K) - mg/kg' : 'پوٹاشیم (K)'}
                                </label>
                                <input
                                    type="number"
                                    value={soilPotassium}
                                    onChange={(e) => setSoilPotassium(e.target.value)}
                                    placeholder="e.g., 150"
                                    min="0"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        className="get-recommendation-btn"
                        onClick={handleGetRecommendation}
                        disabled={loading || !selectedCrop || !selectedSoil || !landSize}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                {language === 'en' ? 'Processing...' : 'منتظر رہیں...'}
                            </>
                        ) : (
                            <>
                                🌾 {language === 'en'   ? 'Get AI-Based Suggestion'   : 'AI پر مبنی تجویز حاصل کریں'}
                            </>
                        )}
                    </button>

                    {!hasSoilTest && (
                        <p className="info-text">
                            ℹ️ {language === 'en'
                                ? 'Without soil test, we\'ll use average values for your region'
                                : 'مٹی کی جانچ کے بغیر، ہم آپ کے علاقے کی اوسط قدریں استعمال کریں گے'}
                        </p>
                    )}
                </div>
            )}

            {step === 'recommendation' && prediction && (
                <div className="recommendation-section">
                    <button className="back-btn" onClick={handleReset}>
                        ← {language === 'en' ? 'New Search' : 'نئی تلاش'}
                    </button>

                    <div className="prediction-card">
                        <div className="prediction-header">
                            <div className="confidence-badge">
                                <span className="confidence-label">
                                    {language === 'en' ? 'AI Confidence' : 'AI اعتماد'}
                                </span>
                                <span className="confidence-value">{prediction.confidence}%</span>
                            </div>
                        </div>

                        <div className="recommended-fertilizer">
                            <h3>{language === 'en' ? 'Suggested Fertilizer' : 'تجویز کردہ کھاد'}</h3>
                            <div className="fertilizer-name">
                                <span className="fertilizer-icon">🌱</span>
                                <div>
                                    <p className="fertilizer-english">{prediction.recommended_fertilizer}</p>
                                    <p className="fertilizer-urdu">
                                        {getFertilizerNameUrdu(prediction.recommended_fertilizer)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="fertilizer-details-grid">
                            <div className="detail-card">
                                <span className="detail-icon">📦</span>
                                <div>
                                    <p className="detail-label">
                                        {language === 'en' ? 'Quantity' : 'مقدار'}
                                    </p>
                                    <p className="detail-value">{prediction.quantity} kg</p>
                                </div>
                            </div>

                            <div className="detail-card">
                                <span className="detail-icon">💰</span>
                                <div>
                                    <p className="detail-label">
                                        {language === 'en' ? 'Estimated Cost' : 'تخمینہ قیمت'}
                                    </p>
                                    <p className="detail-value">PKR {prediction.estimatedCost.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="detail-card">
                                <span className="detail-icon">📏</span>
                                <div>
                                    <p className="detail-label">
                                        {language === 'en' ? 'Land Size' : 'رقبہ'}
                                    </p>
                                    <p className="detail-value">{prediction.landSize} {language === 'en' ? 'acres' : 'ایکڑ'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="input-summary">
                            <h4>{language === 'en' ? 'Based on Your Input' : 'آپ کی معلومات کی بنیاد پر'}</h4>
                            <div className="summary-grid">
                                <div className="summary-item">
                                    <span className="summary-label">
                                        {language === 'en' ? 'Crop' : 'فصل'}:
                                    </span>
                                    <span className="summary-value">{prediction.input_summary.crop}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">
                                        {language === 'en' ? 'Soil' : 'مٹی'}:
                                    </span>
                                    <span className="summary-value">{prediction.input_summary.soil}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">N:</span>
                                    <span className="summary-value">{prediction.input_summary.N} mg/kg</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">P:</span>
                                    <span className="summary-value">{prediction.input_summary.P} mg/kg</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">K:</span>
                                    <span className="summary-value">{prediction.input_summary.K} mg/kg</span>
                                </div>
                            </div>
                        </div>

                        {prediction.alternatives && prediction.alternatives.length > 0 && (
                            <div className="alternatives-section">
                                <h4>{language === 'en' ? 'Alternative Options' : 'متبادل اختیارات'}</h4>
                                <div className="alternatives-list">
                                    {prediction.alternatives.map((alt, index) => (
                                        <div key={index} className="alternative-item">
                                            <span className="alt-name">{alt.name}</span>
                                            <span className="alt-confidence">{alt.confidence}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="precautions-section">
                            <h4>⚠️ {language === 'en' ? 'Important Precautions' : 'اہم احتیاطی تدابیر'}</h4>
                            <ul>
                                <li>
                                    {language === 'en'
                                        ? 'Store fertilizer in a cool, dry place'
                                        : 'کھاد کو ٹھنڈی اور خشک جگہ پر رکھیں'}
                                </li>
                                <li>
                                    {language === 'en'
                                        ? 'Use protective equipment during application'
                                        : 'استعمال کے وقت حفاظتی سامان استعمال کریں'}
                                </li>
                                <li>
                                    {language === 'en'
                                        ? 'Apply fertilizer with irrigation for best results'
                                        : 'بہترین نتائج کے لیے پانی کے ساتھ استعمال کریں'}
                                </li>
                                <li>
                                    {language === 'en'
                                        ? 'Keep away from children and animals'
                                        : 'بچوں اور جانوروں سے دور رکھیں'}
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={handleSpeak}
                            disabled={!audioUnlocked}
                            style={{
                                margin: '16px 0',
                                padding: '12px 24px',
                                background: audioUnlocked ? '#10b981' : '#94a3b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: audioUnlocked ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            🔊 {audioUnlocked
                                ? (language === 'en' ? 'Speak Recommendation' : 'تجویز سنائیں')
                                : (language === 'en' ? 'Tap to Unlock' : 'ٹچ کریں')
                            }
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FertilizerOptimizer;