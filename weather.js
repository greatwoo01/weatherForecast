// 和风天气API配置
const API_KEY = 'b4bdd56a82ff43aca425a1a442852cb6'; // 请替换为你的和风天气API密钥
const GEO_API_URL = 'https://ny2vhdbctv.re.qweatherapi.com/geo/v2/city/lookup';
let CITY_ID = '';

// 获取设备位置并转换为城市ID
async function getLocationAndCityId() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const geoResponse = await fetch(`${GEO_API_URL}?location=${longitude},${latitude}&key=${API_KEY}`);
                        console.log('geoResponse:', await geoResponse.clone().json());
                        const geoData = await geoResponse.json();
                        
                        if (geoData.code === '200' && geoData.location.length > 0) {
                            CITY_ID = geoData.location[0].id;
                            resolve(CITY_ID);
                        } else {
                            reject(new Error('无法获取城市ID: ' + (geoData.message || '未知错误')));
                        }
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error('浏览器不支持地理位置功能'));
        }
    });
}

// 获取天气数据
async function fetchWeatherData() {
    try {
        if (!CITY_ID) {
            await getLocationAndCityId();
        }
        const API_URL = `https://ny2vhdbctv.re.qweatherapi.com/v7/weather/now?location=${CITY_ID}&key=${API_KEY}`;
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if(data.code === '200') {
            updateWeatherUI(data.now);
        } else {
            console.error('获取天气数据失败:', data.message);
            document.getElementById('weatherInfo').innerHTML = 
                `<div class="weather-card">获取天气数据失败: ${data.message}</div>`;
        }
    } catch (error) {
        console.error('获取天气数据时出错:', error);
        document.getElementById('weatherInfo').innerHTML = 
            `<div class="weather-card">获取天气数据时出错: ${error.message}</div>`;
    }
}

// 更新UI显示天气数据
function updateWeatherUI(weatherData) {
    const weatherInfo = document.getElementById('weatherInfo');
    
    // 简单示例：显示当前天气
    weatherInfo.innerHTML = `
        <div class="weather-card">
            <img src="https://a.hecdn.net/img/common/icon/202106d/${weatherData.icon}.png" 
                 alt="天气图标" class="weather-icon">
            <div>
                <h2>${weatherData.text}</h2>
                <p>温度: ${weatherData.temp}°C</p>
                <p>湿度: ${weatherData.humidity}%</p>
                <p>风速: ${weatherData.windSpeed}公里/小时</p>
                <p>风向: ${weatherData.windDir}</p>
                <p>更新时间: ${weatherData.obsTime}</p>
            </div>
        </div>
    `;
}

// 导出函数供HTML页面调用
window.fetchWeatherData = fetchWeatherData;