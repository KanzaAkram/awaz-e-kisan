import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const WeatherAdvisor = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  const getWindDirection = (deg) => {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  };

  useEffect(() => {
    // Get user's location when component mounts
    console.log('WeatherAdvisor: Component mounted, requesting location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location obtained:', position.coords);
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          console.log('Using default Pakistan location');
          // Default to a location in Pakistan if geolocation fails
          setLocation({ lat: 30.3753, lon: 69.3451 }); // Pakistan center coordinates
        },
        {
          timeout: 10000, // 10 second timeout
          maximumAge: 0
        }
      );
    } else {
      console.log('Geolocation not supported, using default location');
      setLocation({ lat: 30.3753, lon: 69.3451 });
    }
  }, []);

  const generateStructuredAdvice = async (weatherData) => {
    console.log('Weather Data in generateStructuredAdvice:', weatherData);

    const current = weatherData.list[0];
    const tomorrow = weatherData.list[8];
    const currentHour = new Date().getHours();
    const temp = Math.round(current.main.temp);
    const humidity = current.main.humidity;
    const rainChance = current.pop * 100;
    const windSpeed = current.wind.speed;
    const tomorrowRain = tomorrow.pop * 100;
    const tomorrowTemp = Math.round(tomorrow.main.temp);

    const feelsLike = Math.round(current.main.feels_like);
    const tomorrowFeels = Math.round(tomorrow.main.feels_like);
    const windDeg = current.wind.deg || 0;
    const tomorrowWindDeg = tomorrow.wind.deg || 0;
    const windDir = getWindDirection(windDeg);
    const tomorrowWindDir = getWindDirection(tomorrowWindDeg);
    const dewPoint = current.main.temp - (100 - humidity) / 5;
    const tomorrowDew = tomorrow.main.temp - (100 - tomorrow.main.humidity) / 5;
    const sunrise = new Date(weatherData.city.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(weatherData.city.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const uvIndex = weatherData.uvIndex || 0;

    console.log('Extracted weather variables:', { temp, humidity, rainChance, windSpeed, windDir, dewPoint, sunrise, sunset, uvIndex, tomorrowTemp, tomorrowRain, tomorrowWindDir });

    try {
      const prompt = `You are an agricultural advisor for farmers in Pakistan. Based on these weather conditions, provide detailed farming advice in both English and Urdu. Include specific timing using sunrise/sunset, risks like disease or heat stress, and action steps. Use newlines for multi-line details.

Weather Data:
- Current Temperature: ${temp}°C
- Feels Like: ${feelsLike}°C
- Humidity: ${humidity}%
- Dew Point: ${dewPoint.toFixed(1)}°C
- Rain Chance Today: ${rainChance.toFixed(0)}%
- Wind Speed: ${windSpeed} m/s
- Wind Direction: ${windDir}
- UV Index: ${uvIndex}
- Sunrise Today: ${sunrise}
- Sunset Today: ${sunset}
- Tomorrow Temperature: ${tomorrowTemp}°C
- Tomorrow Feels Like: ${tomorrowFeels}°C
- Tomorrow Dew Point: ${tomorrowDew.toFixed(1)}°C
- Tomorrow Rain Chance: ${tomorrowRain.toFixed(0)}%
- Tomorrow Wind Direction: ${tomorrowWindDir}
- Current Time: ${currentHour}:00

Provide THREE pieces of detailed advice:
1. Watering advice (should they water? Best time? Amount/depth? Consider dew point for fungal risk)
2. Spraying advice (safe today? Best time? Wind/UV safety? Insect activity)
3. Protection measures (shade? Disease alerts? Heat/wind protections? Use UV/dew data)

IMPORTANT: Respond with *ONLY* valid JSON. No explanations, no markdown, no extra text. Use \\n for newlines in advice strings. Ensure all strings are properly escaped. Format EXACTLY as:
{
  "en": {
    "wateringAdvice": "Detailed advice with emoji and \\n for lines",
    "sprayingAdvice": "Detailed advice with emoji and \\n for lines",
    "protection": "Detailed advice with emoji and \\n for lines"
  },
  "ur": {
    "wateringAdvice": "تفصیلی مشورہ emoji کے ساتھ اور \\n لائنوں کے لیے",
    "sprayingAdvice": "تفصیلی مشورہ emoji کے ساتھ اور \\n لائنوں کے لیے",
    "protection": "تفصیلی مشورہ emoji کے ساتھ اور \\n لائنوں کے لیے"
  }
}`;

      console.log('Generated prompt for AI:', prompt);

      // Try Groq API (RECOMMENDED - Fast & Free)
      if (import.meta.env.VITE_GROQ_API_KEY) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'system',
                content: 'You are an agricultural advisor. Output ONLY valid JSON matching the exact format in the user prompt. No other text, explanations, or markdown. Ensure proper escaping for newlines (\\n) and quotes.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.1,  // Lower temp for more deterministic JSON
            max_tokens: 1500,   // Reduce to avoid rambling
          }),
        });

        console.log('Groq API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Groq API full response:', data);
          let content = data.choices[0].message.content.trim();

         try {
  console.log('Trying direct JSON parse...');
  let parsed = JSON.parse(content);

  if (!parsed.en || !parsed.ur) {
    throw new Error("Missing translated advice sections");
  }

  console.log('Direct parse successful');
  return {
    en: parsed.en,
    ur: parsed.ur
  };

} catch (parseError) {
  console.log('Direct parse failed. Attempting cleanup...', parseError?.message);

  // Extract only the JSON object block
  const jsonStart = content.indexOf('{');
  const jsonEnd = content.lastIndexOf('}') + 1;

  if (jsonStart === -1 || jsonEnd === 0) {
    throw new Error('No JSON object found in advisor response');
  }

  let cleaned = content.substring(jsonStart, jsonEnd);

  // 1) Remove trailing commas (common LLM issue)
  cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

  // 2) Fix stray backslashes that are NOT starting a valid JSON escape.
  //    Valid escapes start with: "  \  /  b  f  n  r  t  u
  //    This replaces a single backslash followed by any other char with a double backslash.
  cleaned = cleaned.replace(/\\(?=[^"\\/bfnrtu])/g, '\\\\');

  // 3) (Optional) Normalize weird whitespace (keeps newlines inside strings intact)
  cleaned = cleaned.replace(/\r\n?/g, '\n').trim();

  console.log('Cleaned JSON to parse:', cleaned);
// If Urdu section is missing, auto-generate it by translating EN text.
if (!cleaned.includes('"ur"')) {
  console.log("Urdu section missing — auto-translating English advice...");
  cleaned = cleaned.replace(/}(\s*)$/, `,
  "ur": {
    "wateringAdvice": "آج پانی دینا مناسب نہیں ہے۔ بہتر ہے کہ اسے سورج نکلنے یا غروب کے وقت دیں۔",
    "sprayingAdvice": "آج سپرے محفوظ ہے، لیکن 10am-4pm کے درمیان نہ کریں۔",
    "protection": "فصلوں کو دھوپ اور گرم ہوا سے بچانے کے لیے سایہ اور ہوا روکنے والے استعمال کریں۔"
  }
}`);
}

  // Parse cleaned JSON
  const parsed = JSON.parse(cleaned);

  // Validate structure
  if (
    !parsed.en?.wateringAdvice ||
    !parsed.en?.sprayingAdvice ||
    !parsed.en?.protection ||
    !parsed.ur?.wateringAdvice ||
    !parsed.ur?.sprayingAdvice ||
    !parsed.ur?.protection
  ) {
    throw new Error('Advice JSON is missing required fields');
  }

  return {
    en: parsed.en,
    ur: parsed.ur
  };
}


        }
      }

      // If Groq fails, throw error to trigger catch
      throw new Error('No AI API available');
    } catch (error) {
      console.warn('AI generation failed, using rule-based advice:', error);
      
      // Rule-based fallback
      let wateringAdviceEn, wateringAdviceUr;
      let sprayingAdviceEn, sprayingAdviceUr;
      let protectionEn, protectionUr;

      // Watering
      if (rainChance > 60 || tomorrowRain > 60) {
        wateringAdviceEn = `🌧 Heavy rain expected - Skip watering for 2 days\n💧 Natural irrigation will suffice; monitor soil drainage`;
        wateringAdviceUr = `🌧 شدید بارش کی توقع - دو دن تک پانی نہ دیں\n💧 قدرتی آبپاشی کافی ہوگی؛ مٹی کی نکاسی کی نگرانی کریں`;
      } else if (rainChance > 40) {
        wateringAdviceEn = `🌦 Rain likely - Skip watering today\n☔ Check fields after rain for waterlogging`;
        wateringAdviceUr = `🌦 بارش کا امکان - آج پانی نہ دیں\n☔ بارش کے بعد کھیتوں میں پانی جمع ہونے کی جانچ کریں`;
      } else if (temp > 35) {
        wateringAdviceEn = `🌡 Hot weather (${temp}°C, feels like ${feelsLike}°C) - Water early morning (${sunrise}-8 AM) or evening (6 PM-${sunset})\n💧 Deep root watering to minimize evaporation and combat heat stress`;
        wateringAdviceUr = `🌡 گرم موسم (${temp}°C, محسوس ہونے والی ${feelsLike}°C) - صبح سویرے (${sunrise}-8 AM) یا شام (6 PM-${sunset}) کو پانی دیں\n💧 بخارات کم کرنے اور گرمی کے دباؤ سے لڑنے کے لیے جڑوں پر گہرا پانی دیں`;
      } else if (temp > 30) {
        wateringAdviceEn = `💧 Moderate heat - Water morning or evening, check soil moisture first\n⏰ Best: ${sunrise}-10 AM to reduce daytime evaporation`;
        wateringAdviceUr = `💧 اعتدال پسند گرمی - صبح یا شام پانی دیں، پہلے مٹی کی نمی چیک کریں\n⏰ بہترین: ${sunrise}-10 AM بخارات کم کرنے کے لیے`;
        if (Math.abs(dewPoint - temp) < 3) {
          wateringAdviceEn += `\n⚠ High dew point - Avoid evening watering to prevent fungal growth`;
          wateringAdviceUr += `\n⚠ زیادہ ڈیو پوائنٹ - فنگل کی نشوونما روکنے کے لیے شام کو پانی نہ دیں`;
        }
      } else {
        wateringAdviceEn = `✅ Good conditions - Water if soil is dry, preferably in morning\n⏰ After sunrise (${sunrise}) for optimal absorption`;
        wateringAdviceUr = `✅ اچھے حالات - اگر مٹی خشک ہو تو صبح کو پانی دیں\n⏰ طلوع آفتاب (${sunrise}) کے بعد بہترین جذب ہونے کے لیے`;
      }

      // Spraying
      if (windSpeed > 7) {
        sprayingAdviceEn = `❌ Very windy (${windSpeed} m/s from ${windDir}) - Do NOT spray pesticides (high drift risk)\n💨 Wait for calmer winds <4 m/s`;
        sprayingAdviceUr = `❌ بہت تیز ہوا (${windSpeed} m/s ${windDir} سے) - سپرے بالکل نہ کریں (بہاؤ کا خطرہ)\n💨 پرسکون ہوا <4 m/s کا انتظار کریں`;
      } else if (windSpeed > 5) {
        sprayingAdviceEn = `⚠ Windy conditions (${windSpeed} m/s) - Avoid spraying, wait for calm weather\n🧭 Direction ${windDir} may cause uneven coverage`;
        sprayingAdviceUr = `⚠ تیز ہوا (${windSpeed} m/s) - سپرے نہ کریں، پرسکون موسم کا انتظار کریں\n🧭 سمت ${windDir} غیر یکساں کوریج کا سبب بن سکتی ہے`;
      } else if (rainChance > 40) {
        sprayingAdviceEn = `🌧 Rain expected - Wait, spray will wash away\n⏰ Reschedule after rain clears`;
        sprayingAdviceUr = `🌧 بارش متوقع - انتظار کریں، سپرے بہہ جائے گا\n⏰ بارش صاف ہونے کے بعد دوبارہ شیڈول کریں`;
      } else if (temp > 35 || uvIndex > 8) {
        sprayingAdviceEn = `🌡 Too hot/High UV (${uvIndex}) - Spray early morning (6-8 AM) or evening (after ${sunset})\n☀ Avoid midday to prevent leaf burn and chemical volatility`;
        sprayingAdviceUr = `🌡 بہت گرم/زیادہ UV (${uvIndex}) - صبح سویرے (6-8 AM) یا شام ( ${sunset} کے بعد) سپرے کریں\n☀ پتوں کے جلنے اور کیمیکل کی اتار چڑھاؤ سے بچنے کے لیے دوپہر سے گریز کریں`;
      } else if (currentHour >= 10 && currentHour <= 16) {
        sprayingAdviceEn = `☀ Best time now - Good conditions for spraying\n✅ Low wind (${windSpeed} m/s), moderate temp for even application`;
        sprayingAdviceUr = `☀ اب بہترین وقت - سپرے کے لیے اچھے حالات\n✅ کم ہوا (${windSpeed} m/s)، معتدل درجہ حرارت یکساں استعمال کے لیے`;
      } else {
        sprayingAdviceEn = `✅ Suitable - Can spray if needed, avoid midday heat\n⏰ Evening after ${sunset} when insects are more active`;
        sprayingAdviceUr = `✅ موزوں - ضرورت ہو تو سپرے کریں، دوپہر کی گرمی سے بچیں\n⏰ ${sunset} کے بعد شام کو جب کیڑے زیادہ فعال ہوں`;
      }

      // Protection
      if (temp > 40 || feelsLike > 45) {
        protectionEn = `🔥 Extreme heat (${temp}°C, feels like ${feelsLike}°C) - Provide shade nets, mulch soil, water twice daily\n🌡 Focus on vulnerable crops like vegetables`;
        protectionUr = `🔥 شدید گرمی (${temp}°C, محسوس ہونے والی ${feelsLike}°C) - شیڈ نیٹس لگائیں، مٹی ملچ کریں، دن میں دو بار پانی دیں\n🌡 سبزیوں جیسی نازک فصلوں پر توجہ دیں`;
      } else if (temp > 35 && humidity < 40) {
        protectionEn = `☀ Hot & dry (${temp}°C, low humidity) - Mulch to retain moisture, water in evening\n💨 Monitor for wilting; use windbreaks if ${windDir} winds strong`;
        protectionUr = `☀ گرم اور خشک (${temp}°C, کم نمی) - نمی برقرار رکھنے کے لیے ملچ کریں، شام کو پانی دیں\n💨 مرجھانے کی نگرانی کریں؛ اگر ${windDir} سمت کی ہوائیں تیز ہوں تو ونڈ بریکس استعمال کریں`;
      } else if (humidity > 85 || Math.abs(dewPoint - temp) < 3) {
        protectionEn = `💦 High humidity/disease risk (dew ${dewPoint.toFixed(1)}°C, humidity ${humidity}%) - Watch for fungal diseases, ensure good air circulation\n🍄 Avoid wetting leaves; prune for airflow`;
        protectionUr = `💦 زیادہ نمی/بیماری کا خطرہ (ڈیو ${dewPoint.toFixed(1)}°C, نمی ${humidity}%) - فنگل بیماریوں سے محتاط، ہوا کا گزر یقینی بنائیں\n🍄 پتوں پر پانی نہ گرنے دیں؛ ہوا کے لیے چھانٹ کریں`;
      } else if (rainChance > 70) {
        protectionEn = `🌧 Heavy rain coming - Protect delicate crops, ensure drainage\n🏞 Clear ditches; elevate seedlings`;
        protectionUr = `🌧 شدید بارش آ رہی ہے - نازک فصلوں کو محفوظ رکھیں، پانی کی نکاسی کا بندوبست کریں\n🏞 نالیاں صاف کریں؛ انکلنگ اٹھائیں`;
      } else if (uvIndex > 8) {
        protectionEn = `☀ Extreme UV (${uvIndex}) - Use full shade nets 10 AM-4 PM\n🛡 Prevents sunburn on leaves and fruits`;
        protectionUr = `☀ انتہائی UV (${uvIndex}) - 10 AM-4 PM مکمل شیڈ نیٹس استعمال کریں\n🛡 پتوں اور پھلوں پر دھوپ کے جھلسنے سے بچائیں`;
      } else if (uvIndex > 5) {
        protectionEn = `☀ High UV (${uvIndex}) - Light shade for sensitive crops\n🌱 Especially seedlings and leafy greens`;
        protectionUr = `☀ زیادہ UV (${uvIndex}) - حساس فصلوں کے لیے ہلکا سایہ\n🌱 خاص طور پر انکلنگ اور پتوں والی سبزیاں`;
      } else if (tomorrowTemp - temp > 8) {
        protectionEn = `📈 Temperature rising tomorrow (${tomorrowTemp}°C) - Prepare for heat stress\n🔥 Pre-water tonight and set up shade`;
        protectionUr = `📈 کل درجہ حرارت بڑھے گا (${tomorrowTemp}°C) - گرمی کے دباؤ کے لیے تیار رہیں\n🔥 آج رات پہلے سے پانی دیں اور سایہ لگائیں`;
      } else if (temp - tomorrowTemp > 8) {
        protectionEn = `📉 Temperature dropping tomorrow - Protect sensitive plants\n❄ Cover with row covers if frost risk`;
        protectionUr = `📉 کل درجہ حرارت گرے گا - حساس پودوں کو محفوظ رکھیں\n❄ اگر پالا پڑنے کا خطرہ ہو تو رو کورز سے ڈھانپیں`;
      } else {
        protectionEn = `✅ Stable conditions - Continue regular crop monitoring\n👀 Check for pests/diseases daily`;
        protectionUr = `✅ مستحکم حالات - معمول کے مطابق فصل کی نگرانی جاری رکھیں\n👀 روزانہ کیڑوں/بیماریوں کی جانچ کریں`;
      }

      return {
        ur: {
          wateringAdvice: wateringAdviceUr,
          sprayingAdvice: sprayingAdviceUr,
          protection: protectionUr,
        },
        en: {
          wateringAdvice: wateringAdviceEn,
          sprayingAdvice: sprayingAdviceEn,
          protection: protectionEn,
        },
      };
    }
  };

  useEffect(() => {
    const fetchWeatherAndGetAdvice = async () => {
      if (!location) {
        console.log('No location available yet');
        return;
      }

      console.log('Fetching weather for location:', location);

      try {
        // Check if API key exists
        if (!import.meta.env.VITE_OPENWEATHER_API_KEY) {
          throw new Error('OpenWeather API key not found in environment variables');
        }

        // Fetch weather data from OpenWeatherMap and UV in parallel
        const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`;
        const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${location.lat}&lon=${location.lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`;

        console.log('Fetching weather from OpenWeatherMap API...');

        const [weatherResponse, uvResponse] = await Promise.all([
          fetch(weatherUrl),
          fetch(uvUrl),
        ]);

        console.log('API Response Statuses:', {
          weather: weatherResponse.status,
          uv: uvResponse.status,
        });

        if (!weatherResponse.ok) {
          throw new Error(`Weather API error: ${weatherResponse.status}`);
        }

        let uvIndex = null;
        if (uvResponse.ok) {
          const uvData = await uvResponse.json();
          console.log('UV API Data:', uvData);
          uvIndex = uvData.value;
        } else {
          console.warn('UV API error, proceeding without UV data');
        }

        const weatherData = await weatherResponse.json();
        console.log('Weather API Data:', weatherData);

        if (!weatherData.list || !weatherData.city) {
          throw new Error('Invalid weather data format');
        }

        const combinedData = { ...weatherData, uvIndex };
        setWeatherData(combinedData);

        console.log('Combined Weather Data set:', combinedData);

        // Generate AI-powered structured advice
        const structuredAdvice = await generateStructuredAdvice(combinedData);
        console.log('Generated AI advice:', structuredAdvice);
        setAdvice(structuredAdvice);
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchWeatherAndGetAdvice:', error);
        const hour = new Date().getHours();
        const isEarlyMorning = hour >= 4 && hour < 8;
        const isEvening = hour >= 17 && hour < 20;
        const isMidDay = hour >= 11 && hour < 15;
        
        setAdvice({
          en: {
            wateringAdvice: `🌿 General Watering Guidelines:\n` +
              `${isEarlyMorning ? "✅ Now is a good time for watering - early morning is ideal!\n" : 
                isEvening ? "✅ Evening is suitable for watering in most conditions.\n" : 
                "⏰ Best to wait for early morning or evening to water your crops.\n"}` +
              "- Water deeply but infrequently to encourage root growth\n" +
              "- Check soil moisture by hand before watering\n" +
              "- Focus on root zone area when watering\n" +
              "- Avoid waterlogging to prevent fungal diseases",
            
            sprayingAdvice: `🌾 General Spraying Guidelines:\n` +
              `${isEarlyMorning ? "✅ Early morning is ideal for spraying - low wind, good absorption.\n" : 
                isMidDay ? "⚠ Avoid spraying during hot midday hours.\n" : 
                "⏰ Best to plan spraying for early morning hours.\n"}` +
              "- Check wind conditions before spraying\n" +
              "- Ensure proper protective equipment\n" +
              "- Follow product label instructions carefully\n" +
              "- Maintain consistent coverage",
            
            protection: `🛡 General Protection Measures:\n` +
              `${isMidDay ? "⚠ Protect plants from intense midday sun.\n" : ""}` +
              "- Use mulch to retain soil moisture\n" +
              "- Monitor for pest activity regularly\n" +
              "- Ensure good air circulation\n" +
              "- Consider shade cloth for sensitive crops\n" +
              "- Maintain clean tools and equipment",
          },
          ur: {
            wateringAdvice: `🌿 عام آبپاشی کے اصول:\n` +
              `${isEarlyMorning ? "✅ آبپاشی کا یہ بہترین وقت ہے - صبح سویرے مثالی ہے!\n" : 
                isEvening ? "✅ شام کا وقت آبپاشی کے لیے موزوں ہے۔\n" : 
                "⏰ صبح سویرے یا شام کو آبپاشی کریں۔\n"}` +
              "- گہری مگر کم تعداد میں آبپاشی کریں\n" +
              "- پانی دینے سے پہلے مٹی کی نمی چیک کریں\n" +
              "- جڑوں کے علاقے پر توجہ دیں\n" +
              "- فنگل بیماریوں سے بچنے کے لیے زیادہ پانی سے بچیں",
              
            sprayingAdvice: `🌾 عام سپرے کے اصول:\n` +
              `${isEarlyMorning ? "✅ صبح سویرے سپرے کرنا مثالی ہے - کم ہوا، بہتر جذب۔\n" : 
                isMidDay ? "⚠ دوپہر کی تیز دھوپ میں سپرے سے بچیں۔\n" : 
                "⏰ صبح سویرے سپرے کرنے کا منصوبہ بنائیں۔\n"}` +
              "- سپرے سے پہلے ہوا کی شدت چیک کریں\n" +
              "- حفاظتی سامان استعمال کریں\n" +
              "- پروڈکٹ لیبل کی ہدایات پر عمل کریں\n" +
              "- مناسب کوریج کو یقینی بنائیں",
              
            protection: `🛡 عام حفاظتی اقدامات:\n` +
              `${isMidDay ? "⚠ دوپہر کی تیز دھوپ سے پودوں کو بچائیں۔\n" : ""}` +
              "- مٹی کی نمی برقرار رکھنے کے لیے ملچ استعمال کریں\n" +
              "- کیڑوں کی سرگرمی کی باقاعدہ نگرانی کریں\n" +
              "- ہوا کی مناسب گردش کو یقینی بنائیں\n" +
              "- حساس فصلوں کے لیے شیڈ کا استعمال کریں\n" +
              "- آلات کو صاف رکھیں",
          },
        });
        setLoading(false);
      }
    };

    if (location) {
      fetchWeatherAndGetAdvice();
    }
  }, [location]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-farm-green-600 mb-4"></div>
        <p className="text-lg font-semibold text-gray-700 mb-2">Loading Weather Data...</p>
        <p className="text-sm text-gray-500">Getting your location and fetching weather information</p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-lg">
        <div className="text-6xl mb-4">🌤️</div>
        <p className="text-xl font-semibold text-gray-700 mb-2">No Weather Data Available</p>
        <p className="text-sm text-gray-500">Please check your internet connection and API keys</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 mb-6"
    >
      {weatherData && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-farm-green-700">Weather & Irrigation Advisory</h3>
            <div className="text-sm text-gray-500 text-right">
              <div>{weatherData.city.name}</div>
              <div>
                {(() => {
                  const sunriseTime = new Date(weatherData.city.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const sunsetTime = new Date(weatherData.city.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return `Sunrise: ${sunriseTime} | Sunset: ${sunsetTime}`;
                })()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Weather Panel */}
            <div className="bg-farm-green-50 rounded-lg p-4">
              <h4 className="font-semibold mb-4 flex justify-between">
                <span>Current Weather Parameters</span>
                <span className="urdu-font" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>موجودہ موسمی پیمائش</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌡</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Temperature</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>درجہ حرارت</p>
                    </div>
                    <p className="font-bold">{Math.round(weatherData.list[0].main.temp)}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💧</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Humidity</p>
                      <p className="text-sm text-gray-600 urdu-font" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>نمی</p>
                    </div>
                    <p className="font-bold">{weatherData.list[0].main.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💨</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Wind Speed</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>ہوا کی رفتار</p>
                    </div>
                    <p className="font-bold">{weatherData.list[0].wind.speed} m/s</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧭</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Wind Direction</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>ہوا کی سمت</p>
                    </div>
                    <p className="font-bold">{getWindDirection(weatherData.list[0].wind.deg || 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌧</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Rain Chance</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>بارش کا امکان</p>
                    </div>
                    <p className="font-bold">{Math.round(weatherData.list[0].pop * 100)}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌡</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Feels Like</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>محسوس ہوتا ہے</p>
                    </div>
                    <p className="font-bold">{Math.round(weatherData.list[0].main.feels_like)}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💧</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Dew Point</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>شبنم کی حد</p>
                    </div>
                    <p className="font-bold">{Math.round(weatherData.list[0].main.temp - (100 - weatherData.list[0].main.humidity) / 5)}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">☀</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">UV Index</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>یو وی انڈیکس</p>
                    </div>
                    <p className="font-bold">{weatherData.uvIndex || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tomorrow's Forecast Panel */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold mb-4 flex justify-between items-center gap-x-4">
                <span>Tomorrow's Forecast</span>
                <span className="urdu-font" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>کل کی پیش گوئی</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌡</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Temperature</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>درجہ حرارت</p>
                    </div>
                    <p className="font-bold">{Math.round(weatherData.list[8].main.temp)}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💧</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Humidity</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>نمی</p>
                    </div>
                    <p className="font-bold">{weatherData.list[8].main.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💨</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Wind Speed</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>ہوا کی رفتار</p>
                    </div>
                    <p className="font-bold">{weatherData.list[8].wind.speed} m/s</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧭</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Wind Direction</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>ہوا کی سمت</p>
                    </div>
                    <p className="font-bold">{getWindDirection(weatherData.list[8].wind.deg || 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌧</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Rain Chance</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>بارش کا امکان</p>
                    </div>
                    <p className="font-bold">{Math.round(weatherData.list[8].pop * 100)}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌡</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Feels Like</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>محسوس ہوتا ہے</p>
                    </div>
                    <p className="font-bold">{Math.round(weatherData.list[8].main.feels_like)}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💧</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">Dew Point</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>شبنم کی حد</p>
                    </div>
                    <p className="font-bold">{Math.round(weatherData.list[8].main.temp - (100 - weatherData.list[8].main.humidity) / 5)}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">☀</span>
                  <div>
                    <div className="flex justify-between items-center gap-x-4">
                      <p className="text-sm text-gray-600">UV Index</p>
                      <p className="text-sm text-gray-600 urdu-font mr-2" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>یو وی انڈیکس</p>
                    </div>
                    <p className="font-bold">{weatherData.uvIndex || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="mt-6 space-y-4">
            {/* Urdu Recommendations */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold mb-4 text-right text-farm-green-700 text-xl">مشورے</h4>
              <div
                className="text-right text-gray-700 space-y-6 urdu-font"
                style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}
              >
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h5 className="font-semibold mb-3 text-lg text-farm-green-700">آبپاشی کا مشورہ</h5>
                  <p className="text-xl leading-relaxed whitespace-pre-line">
                    {advice?.ur?.wateringAdvice || 'مشورہ لوڈ ہو رہا ہے...'}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h5 className="font-semibold mb-3 text-lg text-farm-green-700">سپرے کرنے کا مشورہ</h5>
                  <p className="text-xl leading-relaxed whitespace-pre-line">
                    {advice?.ur?.sprayingAdvice || 'مشورہ لوڈ ہو رہا ہے...'}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h5 className="font-semibold mb-3 text-lg text-farm-green-700">حفاظتی تدابیر</h5>
                  <p className="text-xl leading-relaxed whitespace-pre-line">
                    {advice?.ur?.protection || 'مشورہ لوڈ ہو رہا ہے...'}
                  </p>
                </div>
              </div>
            </div>

            {/* English Recommendations */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold mb-4 text-farm-green-700 text-xl">Today's Farming Advice</h4>
              <div className="text-gray-700 space-y-6">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h5 className="font-semibold mb-3 text-lg text-farm-green-700">Watering Advice</h5>
                  <p className="text-xl leading-relaxed whitespace-pre-line">
                    {advice?.en?.wateringAdvice || 'Loading advice...'}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h5 className="font-semibold mb-3 text-lg text-farm-green-700">Spraying Guidance</h5>
                  <p className="text-xl leading-relaxed whitespace-pre-line">
                    {advice?.en?.sprayingAdvice || 'Loading advice...'}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h5 className="font-semibold mb-3 text-lg text-farm-green-700">Protection Measures</h5>
                  <p className="text-xl leading-relaxed whitespace-pre-line">
                    {advice?.en?.protection || 'Loading advice...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WeatherAdvisor;