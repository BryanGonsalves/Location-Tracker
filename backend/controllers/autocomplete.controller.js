exports.autocomplete = async (req, res) => {
    try {
        const { searchKey } = req.params;

        const fetch = (await import('node-fetch')).default;

        const response = await fetch(`https://nominatim.openstreetmap.org/search?addressdetails=1&q=${searchKey}&format=json`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.educative.io/',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        let data = await response.json();

        data = data.map(place => ({
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
          formattedAddress: place.display_name,
          country: place.address.country || null,
          city: place.address.city || null,
          state: place.address.state || null,
          countryCode: place.address.country_code || null,
        }));

        res.status(200).json({
            message: 'location(s) found!',
            data: data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            data: null,
        });
    }
};