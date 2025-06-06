import wixData from 'wix-data';

$w.onReady(function () {
    wixData.query("Aproperties")
        .ascending("createdDate")
        .limit(9)
        .find()
        .then((results) => {
            const properties = results.items;

            properties.forEach((property, index) => {
                const i = index + 1;

                const address = `${property.exteriorNumber} ${property.street}, ${property.state}`;
                const price = `${property.salePriceCurrency}${property.salePrice}`;
                const imageUrl = property.mainPhoto;

                // Construimos el link dinámico
                const publicId = property.publicId;
                const propertyTitle = property.propertyTitle;

                const dynamicLink = (publicId && propertyTitle) ?
                    `/aproperties/${encodeURIComponent(publicId)}/${encodeURIComponent(propertyTitle)}` :
                    "#";

                // Asignamos valores si existen los elementos
                if (
                    $w(`#addressText${i}`) &&
                    $w(`#priceText${i}`) &&
                    $w(`#mainPropertyPhoto${i}`) &&
                    $w(`#mainPropertyColoredPhoto${i}`) &&
                    $w(`#addressWhiteText${i}`) &&
                    $w(`#viewPropertyDetailsButton${i}`)
                ) {
                    $w(`#addressText${i}`).text = address;
                    $w(`#priceText${i}`).text = price;
                    $w(`#mainPropertyPhoto${i}`).src = imageUrl;
                    $w(`#mainPropertyColoredPhoto${i}`).src = imageUrl;
                    $w(`#addressWhiteText${i}`).text = address;
                    $w(`#viewPropertyDetailsButton${i}`).link = dynamicLink;
                    $w(`#viewPropertyDetailsButton${i}`).target = "_blank";
                }
            });
        })
        .catch((err) => {
            console.error("Error cargando propiedades:", err);
        });

    // Previene múltiples animaciones con flags
  let salesStarted = false;
  let emailsStarted = false;
  let followersStarted = false;
  let agentsStarted = false;

  $w('#salesVolumeText').onViewportEnter(() => {
    if (!salesStarted) {
      salesStarted = true;
      animateFormattedCounter($w, '#salesVolumeText', 0, 1_150_000, 2000); // 1.2M+
    }
  });

  $w('#emailsSentText').onViewportEnter(() => {
    if (!emailsStarted) {
      emailsStarted = true;
      animateFormattedCounter($w, '#emailsSentText', 0, 10_800, 1800); // 9.8K
    }
  });

  $w('#socialFollowersText').onViewportEnter(() => {
    if (!followersStarted) {
      followersStarted = true;
      animateFormattedCounter($w, '#socialFollowersText', 0, 1_050_000, 2000); // 3.1M+
    }
  });

  $w('#agentsText').onViewportEnter(() => {
    if (!agentsStarted) {
      agentsStarted = true;
      animateFormattedCounter($w, '#agentsText', 0, 22, 1000); // 18
    }
  });

});

function animateFormattedCounter($w, elementId, start, end, duration) {
    let current = start;
    const intervalTime = 50;
    const increment = (end - start) / (duration / intervalTime);

    const formatNumber = (num) => {
        let suffix = '';
        let formatted = num;

        if (num >= 1_000_000_000) {
            formatted = (num / 1_000_000_000);
            suffix = 'B';
        } else if (num >= 1_000_000) {
            formatted = (num / 1_000_000);
            suffix = 'M';
        } else if (num >= 1_000) {
            formatted = (num / 1_000);
            suffix = 'K';
        } else {
            return num.toLocaleString(); // no sufijo, número normal
        }

        // Redondeo a una decimal
        formatted = Math.floor(formatted * 10) / 10;

        // Agrega '+' si el número supera la mitad de la unidad
        const threshold = Math.pow(10, suffix === 'B' ? 9 : suffix === 'M' ? 6 : 3) * (Math.floor(formatted) + 0.5);
        const addPlus = num >= threshold ? '+' : '';

        return `${formatted}${suffix}${addPlus}`;
    };

    const interval = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(interval);
        }

        $w(elementId).text = formatNumber(current);
    }, intervalTime);
}

