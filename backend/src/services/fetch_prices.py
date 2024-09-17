import requests
import os

def fetch_prices():
    api_key = os.getenv('COINMARKETCAP_APIKEY')
    headers = {
        'X-CMC_PRO_API_KEY': api_key,
    }

    # Define the endpoint URL and parameters
    url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest'
    symbols = 'ETH,BNB'
    params = {
        'symbol': symbols,
        'convert': 'USD'
    }

    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    prices = {
        'ETH': data['data']['ETH']['quote']['USD']['price'],
        'BNB': data['data']['BNB']['quote']['USD']['price']
    }

    return prices

if __name__ == "__main__":
    prices = fetch_prices()
    print(prices)
