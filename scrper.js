const ScrapingBeeClient = require('scrapingbee');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(require('fs').createWriteStream(filepath))
          .on('error', reject)
          .once('close', () => resolve(filepath));
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    });
  });
};

const scrapeAndDownloadImages = async () => {
  const client = new ScrapingBeeClient('YOUR_SCRAPINGBEE_API_KEY');
  const url = 'https://www.homedepot.com/b/Appliances-Refrigerators/N-5yc1vZc3pi?catStyle=ShowProducts';
  
  try {
    // Create images directory
    await fs.mkdir('images', { recursive: true });
    
    const response = await client.get({
      url: url,
      params: {
        render_js: 'true',
        wait: 2000,
        premium_proxy: 'true'
      }
    });

    const $ = cheerio.load(response.data);
    const products = [];
    let imageCounter = 0;

    for (const element of $('[data-testid="product-pod"]').toArray()) {
      const $product = $(element);
      const productId = $product.closest('[data-product-id]').attr('data-product-id');
      const brand = $product.find('[data-testid="attribute-brandname-inline"]').text().trim();
      const productLabel = $product.find('[data-testid="attribute-product-label"]').text().trim();
      
      const downloadedImages = [];
      const images = $product.find('img[src*="thdstatic"]');
      
      for (const [i, img] of images.toArray().entries()) {
        const src = $(img).attr('src');
        if (src && src.startsWith('http')) {
          try {
            const ext = path.extname(src.split('?')[0]) || '.jpg';
            const filename = `product_${productId}_${i}${ext}`;
            const filepath = path.join('images', filename);
            
            await downloadImage(src, filepath);
            downloadedImages.push({
              url: src,
              localPath: filepath
            });
            console.log(`Downloaded: ${filename}`);
            imageCounter++;
          } catch (err) {
            console.error(`Failed to download image: ${src}`, err.message);
          }
        }
      }

      products.push({
        productId,
        brand,
        name: productLabel,
        images: downloadedImages
      });
    }

    const result = {
      url,
      scrapedAt: new Date().toISOString(),
      totalProducts: products.length,
      totalImagesDownloaded: imageCounter,
      products
    };

    await fs.writeFile('homedepot_with_images.json', JSON.stringify(result, null, 2));
    console.log(`\n✅ Downloaded ${imageCounter} images for ${products.length} products`);

    return result;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

scrapeAndDownloadImages();