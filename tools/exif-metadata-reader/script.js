// EXIF Metadata Reader & Stripper Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropZone = document.getElementById('drop-zone');
  const browseBtn = document.getElementById('browse-btn');
  const fileInput = document.getElementById('file-input');
  const btnLoadSample = document.getElementById('btn-load-sample');

  const previewWrapper = document.getElementById('preview-wrapper');
  const previewImage = document.getElementById('preview-image');
  const metaFilename = document.getElementById('meta-filename');
  const metaFilesize = document.getElementById('meta-filesize');
  const metaDims = document.getElementById('meta-dims');
  const metaMimetype = document.getElementById('meta-mimetype');
  const btnStripExif = document.getElementById('btn-strip-exif');

  const metadataEmptyState = document.getElementById('metadata-empty-state');
  const metadataActiveView = document.getElementById('metadata-active-view');
  const metaTableBody = document.getElementById('meta-table-body');
  const tagSearch = document.getElementById('tag-search');
  const catPills = document.querySelectorAll('.cat-pill');
  const countAll = document.getElementById('count-all');

  const cardCamera = document.getElementById('card-camera');
  const cardLens = document.getElementById('card-lens');
  const cardExposure = document.getElementById('card-exposure');
  const cardFocal = document.getElementById('card-focal');
  const cardDate = document.getElementById('card-date');
  const cardSoftware = document.getElementById('card-software');
  const cardGps = document.getElementById('card-gps');
  const gpsLinksWrap = document.getElementById('gps-links-wrap');
  const linkGmaps = document.getElementById('link-gmaps');
  const linkOsm = document.getElementById('link-osm');

  const btnCopyJson = document.getElementById('btn-copy-json');
  const btnDownloadJson = document.getElementById('btn-download-json');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // State
  let currentFile = null;
  let currentArrayBuffer = null;
  let parsedMetadata = [];
  let currentCategory = 'all';
  let toastTimer = null;

  // Show Toast
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // Helper: Format bytes
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // --- Tag Dictionaries & Definitions ---
  const TIFF_TAGS = {
    0x010E: { name: 'ImageDescription', cat: 'other' },
    0x010F: { name: 'Make', cat: 'camera' },
    0x0110: { name: 'Model', cat: 'camera' },
    0x0112: { name: 'Orientation', cat: 'other' },
    0x011A: { name: 'XResolution', cat: 'other' },
    0x011B: { name: 'YResolution', cat: 'other' },
    0x0128: { name: 'ResolutionUnit', cat: 'other' },
    0x0131: { name: 'Software', cat: 'camera' },
    0x0132: { name: 'DateTime', cat: 'other' },
    0x013B: { name: 'Artist', cat: 'other' },
    0x013E: { name: 'WhitePoint', cat: 'exposure' },
    0x013F: { name: 'PrimaryChromaticities', cat: 'exposure' },
    0x0211: { name: 'YCbCrCoefficients', cat: 'other' },
    0x0213: { name: 'YCbCrPositioning', cat: 'other' },
    0x0214: { name: 'ReferenceBlackWhite', cat: 'other' },
    0x8298: { name: 'Copyright', cat: 'other' },
    0x8769: { name: 'ExifIFDPointer', cat: 'other' },
    0x8825: { name: 'GPSInfoIFDPointer', cat: 'gps' }
  };

  const EXIF_TAGS = {
    0x829A: { name: 'ExposureTime', cat: 'exposure' },
    0x829D: { name: 'FNumber', cat: 'exposure' },
    0x8822: { name: 'ExposureProgram', cat: 'exposure' },
    0x8824: { name: 'SpectralSensitivity', cat: 'exposure' },
    0x8827: { name: 'ISOSpeedRatings', cat: 'exposure' },
    0x8830: { name: 'SensitivityType', cat: 'exposure' },
    0x9000: { name: 'ExifVersion', cat: 'other' },
    0x9003: { name: 'DateTimeOriginal', cat: 'other' },
    0x9004: { name: 'DateTimeDigitized', cat: 'other' },
    0x9101: { name: 'ComponentsConfiguration', cat: 'other' },
    0x9102: { name: 'CompressedBitsPerPixel', cat: 'other' },
    0x9201: { name: 'ShutterSpeedValue', cat: 'exposure' },
    0x9202: { name: 'ApertureValue', cat: 'exposure' },
    0x9203: { name: 'BrightnessValue', cat: 'exposure' },
    0x9204: { name: 'ExposureBiasValue', cat: 'exposure' },
    0x9205: { name: 'MaxApertureValue', cat: 'exposure' },
    0x9206: { name: 'SubjectDistance', cat: 'exposure' },
    0x9207: { name: 'MeteringMode', cat: 'exposure' },
    0x9208: { name: 'LightSource', cat: 'exposure' },
    0x9209: { name: 'Flash', cat: 'exposure' },
    0x920A: { name: 'FocalLength', cat: 'exposure' },
    0x9286: { name: 'UserComment', cat: 'other' },
    0xA000: { name: 'FlashpixVersion', cat: 'other' },
    0xA001: { name: 'ColorSpace', cat: 'other' },
    0xA002: { name: 'PixelXDimension', cat: 'other' },
    0xA003: { name: 'PixelYDimension', cat: 'other' },
    0xA217: { name: 'SensingMethod', cat: 'camera' },
    0xA300: { name: 'FileSource', cat: 'other' },
    0xA301: { name: 'SceneType', cat: 'exposure' },
    0xA401: { name: 'CustomRendered', cat: 'other' },
    0xA402: { name: 'ExposureMode', cat: 'exposure' },
    0xA403: { name: 'WhiteBalance', cat: 'exposure' },
    0xA404: { name: 'DigitalZoomRatio', cat: 'exposure' },
    0xA405: { name: 'FocalLengthIn35mmFilm', cat: 'exposure' },
    0xA406: { name: 'SceneCaptureType', cat: 'exposure' },
    0xA407: { name: 'GainControl', cat: 'exposure' },
    0xA408: { name: 'Contrast', cat: 'exposure' },
    0xA409: { name: 'Saturation', cat: 'exposure' },
    0xA40A: { name: 'Sharpness', cat: 'exposure' },
    0xA431: { name: 'BodySerialNumber', cat: 'camera' },
    0xA432: { name: 'LensSpecification', cat: 'camera' },
    0xA433: { name: 'LensMake', cat: 'camera' },
    0xA434: { name: 'LensModel', cat: 'camera' },
    0xA435: { name: 'LensSerialNumber', cat: 'camera' }
  };

  const GPS_TAGS = {
    0x0000: { name: 'GPSVersionID', cat: 'gps' },
    0x0001: { name: 'GPSLatitudeRef', cat: 'gps' },
    0x0002: { name: 'GPSLatitude', cat: 'gps' },
    0x0003: { name: 'GPSLongitudeRef', cat: 'gps' },
    0x0004: { name: 'GPSLongitude', cat: 'gps' },
    0x0005: { name: 'GPSAltitudeRef', cat: 'gps' },
    0x0006: { name: 'GPSAltitude', cat: 'gps' },
    0x0007: { name: 'GPSTimeStamp', cat: 'gps' },
    0x0008: { name: 'GPSSatellites', cat: 'gps' },
    0x0009: { name: 'GPSStatus', cat: 'gps' },
    0x000A: { name: 'GPSMeasureMode', cat: 'gps' },
    0x000B: { name: 'GPSDOP', cat: 'gps' },
    0x000C: { name: 'GPSSpeedRef', cat: 'gps' },
    0x000D: { name: 'GPSSpeed', cat: 'gps' },
    0x0012: { name: 'GPSMapDatum', cat: 'gps' },
    0x001D: { name: 'GPSDateStamp', cat: 'gps' }
  };

  // --- Formatting Helpers ---
  function formatTagValue(tagId, rawVal, tagName) {
    if (rawVal === undefined || rawVal === null) return '';

    // Exposure Time
    if (tagId === 0x829A || tagName === 'ExposureTime') {
      const val = typeof rawVal === 'number' ? rawVal : (rawVal.num / rawVal.den);
      if (val <= 0) return '0 s';
      if (val < 1) {
        return `1/${Math.round(1 / val)} s (${val.toFixed(4)} s)`;
      }
      return `${val.toFixed(2)} s`;
    }

    // FNumber
    if (tagId === 0x829D || tagName === 'FNumber') {
      const val = typeof rawVal === 'number' ? rawVal : (rawVal.num / rawVal.den);
      return `f/${val.toFixed(1)}`;
    }

    // Focal Length
    if (tagId === 0x920A || tagName === 'FocalLength') {
      const val = typeof rawVal === 'number' ? rawVal : (rawVal.num / rawVal.den);
      return `${val.toFixed(1)} mm`;
    }

    if (tagId === 0xA405 || tagName === 'FocalLengthIn35mmFilm') {
      return `${rawVal} mm (35mm equivalent)`;
    }

    // ISO Speed
    if (tagId === 0x8827 || tagName === 'ISOSpeedRatings') {
      return `ISO ${rawVal}`;
    }

    // Orientation
    if (tagId === 0x0112 || tagName === 'Orientation') {
      const map = {
        1: 'Horizontal (normal)',
        2: 'Mirror horizontal',
        3: 'Rotate 180°',
        4: 'Mirror vertical',
        5: 'Mirror horizontal and rotate 270° CW',
        6: 'Rotate 90° CW',
        7: 'Mirror horizontal and rotate 90° CW',
        8: 'Rotate 270° CW'
      };
      return map[rawVal] || `Orientation ${rawVal}`;
    }

    // Exposure Program
    if (tagId === 0x8822 || tagName === 'ExposureProgram') {
      const map = {
        0: 'Not defined',
        1: 'Manual',
        2: 'Normal program',
        3: 'Aperture priority',
        4: 'Shutter priority',
        5: 'Creative program (depth of field)',
        6: 'Action program (fast shutter speed)',
        7: 'Portrait mode',
        8: 'Landscape mode'
      };
      return map[rawVal] || `Mode ${rawVal}`;
    }

    // Metering Mode
    if (tagId === 0x9207 || tagName === 'MeteringMode') {
      const map = {
        0: 'Unknown',
        1: 'Average',
        2: 'CenterWeightedAverage',
        3: 'Spot',
        4: 'MultiSpot',
        5: 'MultiSegment / Pattern',
        6: 'Partial'
      };
      return map[rawVal] || `Metering ${rawVal}`;
    }

    // Flash
    if (tagId === 0x9209 || tagName === 'Flash') {
      if (typeof rawVal === 'number') {
        const fired = (rawVal & 1) !== 0;
        return fired ? `Flash fired (0x${rawVal.toString(16)})` : `Flash did not fire (0x${rawVal.toString(16)})`;
      }
    }

    // White Balance
    if (tagId === 0xA403 || tagName === 'WhiteBalance') {
      return rawVal === 1 ? 'Manual' : 'Auto';
    }

    // GPS Latitude/Longitude rational array
    if (Array.isArray(rawVal) && rawVal.length === 3 && typeof rawVal[0] === 'object') {
      const deg = rawVal[0].num / rawVal[0].den;
      const min = rawVal[1].num / rawVal[1].den;
      const sec = rawVal[2].num / rawVal[2].den;
      return `${deg}° ${min}' ${sec.toFixed(2)}"`;
    }

    // Altitude
    if (tagId === 0x0006 || tagName === 'GPSAltitude') {
      const alt = typeof rawVal === 'number' ? rawVal : (rawVal.num / rawVal.den);
      return `${alt.toFixed(1)} m above sea level`;
    }

    // Single Rational
    if (rawVal && typeof rawVal === 'object' && 'num' in rawVal && 'den' in rawVal) {
      if (rawVal.den === 1) return `${rawVal.num}`;
      if (rawVal.den === 0) return '0';
      const dec = rawVal.num / rawVal.den;
      return `${dec.toFixed(2)} (${rawVal.num}/${rawVal.den})`;
    }

    return String(rawVal);
  }

  // --- Binary EXIF Parser ---
  function parseBinaryExif(buffer) {
    const view = new DataView(buffer);
    const results = [];
    let tiffStart = -1;

    // 1. Check if JPEG (starts with 0xFFD8)
    if (view.getUint16(0) === 0xFFD8) {
      let offset = 2;
      const length = view.byteLength;

      while (offset < length - 4) {
        const marker = view.getUint16(offset);
        offset += 2;

        // Found APP1 marker (0xFFE1)
        if (marker === 0xFFE1) {
          const app1Length = view.getUint16(offset);
          const exifHeader = view.getUint32(offset + 2); // 'Exif' = 0x45786966
          const zeroWord = view.getUint16(offset + 6); // 0x0000

          if (exifHeader === 0x45786966 && zeroWord === 0x0000) {
            tiffStart = offset + 8;
            break;
          }
          offset += app1Length;
        } else if ((marker & 0xFF00) === 0xFF00) {
          if (marker === 0xFFDA) break; // Start of Scan (image data)
          const blockLength = view.getUint16(offset);
          offset += blockLength;
        } else {
          break;
        }
      }
    }
    // 2. Check if TIFF direct ('II' 0x4949 or 'MM' 0x4D4D)
    else if (view.getUint16(0) === 0x4949 || view.getUint16(0) === 0x4D4D) {
      tiffStart = 0;
    }
    // 3. Check if WebP ('RIFF' ... 'WEBP')
    else if (view.getUint32(0) === 0x52494646 && view.getUint32(8) === 0x57454250) {
      let offset = 12;
      while (offset < view.byteLength - 8) {
        const chunkId = view.getUint32(offset); // 'EXIF' = 0x45584946
        const chunkSize = view.getUint32(offset + 4, true);
        if (chunkId === 0x45584946) {
          // Check if payload starts with 'Exif\0\0'
          if (view.getUint32(offset + 8) === 0x45786966) {
            tiffStart = offset + 14;
          } else {
            tiffStart = offset + 8;
          }
          break;
        }
        offset += 8 + ((chunkSize + 1) & ~1);
      }
    }

    if (tiffStart === -1 || tiffStart + 8 > buffer.byteLength) {
      return results;
    }

    // Read TIFF Header
    const byteOrderMarker = view.getUint16(tiffStart);
    let littleEndian = false;
    if (byteOrderMarker === 0x4949) {
      littleEndian = true;
    } else if (byteOrderMarker === 0x4D4D) {
      littleEndian = false;
    } else {
      return results;
    }

    // Fixed 42
    if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002A) {
      return results;
    }

    const firstIFDOffset = view.getUint32(tiffStart + 4, littleEndian);
    if (firstIFDOffset < 8) return results;

    // Helper to read tag value by type
    function readTagValue(type, count, valOffset) {
      try {
        switch (type) {
          case 1: // BYTE
            if (count === 1) return view.getUint8(valOffset);
            const bytes = [];
            for (let i = 0; i < count; i++) bytes.push(view.getUint8(valOffset + i));
            return bytes;

          case 2: // ASCII string
            let str = '';
            for (let i = 0; i < count; i++) {
              const charCode = view.getUint8(valOffset + i);
              if (charCode === 0) break;
              str += String.fromCharCode(charCode);
            }
            return str.trim();

          case 3: // SHORT (16-bit uint)
            if (count === 1) return view.getUint16(valOffset, littleEndian);
            const shorts = [];
            for (let i = 0; i < count; i++) shorts.push(view.getUint16(valOffset + i * 2, littleEndian));
            return shorts;

          case 4: // LONG (32-bit uint)
            if (count === 1) return view.getUint32(valOffset, littleEndian);
            const longs = [];
            for (let i = 0; i < count; i++) longs.push(view.getUint32(valOffset + i * 4, littleEndian));
            return longs;

          case 5: // RATIONAL (two 32-bit uints)
            if (count === 1) {
              const num = view.getUint32(valOffset, littleEndian);
              const den = view.getUint32(valOffset + 4, littleEndian);
              return { num, den };
            }
            const rationals = [];
            for (let i = 0; i < count; i++) {
              const num = view.getUint32(valOffset + i * 8, littleEndian);
              const den = view.getUint32(valOffset + i * 8 + 4, littleEndian);
              rationals.push({ num, den });
            }
            return rationals;

          case 7: // UNDEFINED
            if (count <= 4) {
              let res = '';
              for (let i = 0; i < count; i++) {
                const b = view.getUint8(valOffset + i);
                if (b >= 32 && b <= 126) res += String.fromCharCode(b);
              }
              return res || `[${count} bytes undefined]`;
            }
            return `[${count} bytes undefined]`;

          case 9: // SLONG (32-bit signed int)
            if (count === 1) return view.getInt32(valOffset, littleEndian);
            const slongs = [];
            for (let i = 0; i < count; i++) slongs.push(view.getInt32(valOffset + i * 4, littleEndian));
            return slongs;

          case 10: // SRATIONAL (two 32-bit signed ints)
            if (count === 1) {
              const num = view.getInt32(valOffset, littleEndian);
              const den = view.getInt32(valOffset + 4, littleEndian);
              return { num, den };
            }
            const srationals = [];
            for (let i = 0; i < count; i++) {
              const num = view.getInt32(valOffset + i * 8, littleEndian);
              const den = view.getInt32(valOffset + i * 8 + 4, littleEndian);
              srationals.push({ num, den });
            }
            return srationals;

          default:
            return `Type ${type}`;
        }
      } catch (e) {
        return `Error reading value: ${e.message}`;
      }
    }

    // IFD Reader
    function readIFD(ifdOffset, tagDict, defaultCat = 'other') {
      const absOffset = tiffStart + ifdOffset;
      if (absOffset + 2 > view.byteLength) return;

      const numEntries = view.getUint16(absOffset, littleEndian);
      let entryOffset = absOffset + 2;

      for (let i = 0; i < numEntries; i++) {
        if (entryOffset + 12 > view.byteLength) break;

        const tag = view.getUint16(entryOffset, littleEndian);
        const type = view.getUint16(entryOffset + 2, littleEndian);
        const count = view.getUint32(entryOffset + 4, littleEndian);

        // Calculate size in bytes
        const typeSizes = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
        const bytes = (typeSizes[type] || 1) * count;

        let valPtr = entryOffset + 8;
        if (bytes > 4) {
          const offsetFromTiff = view.getUint32(entryOffset + 8, littleEndian);
          valPtr = tiffStart + offsetFromTiff;
        }

        if (valPtr + bytes <= view.byteLength) {
          const rawVal = readTagValue(type, count, valPtr);
          const tagInfo = tagDict[tag] || { name: `Unknown_0x${tag.toString(16).toUpperCase().padStart(4, '0')}`, cat: defaultCat };

          // Check for subIFD pointers
          if (tag === 0x8769 && typeof rawVal === 'number') {
            readIFD(rawVal, EXIF_TAGS, 'exposure');
          } else if (tag === 0x8825 && typeof rawVal === 'number') {
            readIFD(rawVal, GPS_TAGS, 'gps');
          } else {
            results.push({
              tag,
              tagHex: `0x${tag.toString(16).toUpperCase().padStart(4, '0')}`,
              name: tagInfo.name,
              category: tagInfo.cat || defaultCat,
              raw: rawVal,
              formatted: formatTagValue(tag, rawVal, tagInfo.name)
            });
          }
        }

        entryOffset += 12;
      }
    }

    // Read IFD0
    readIFD(firstIFDOffset, TIFF_TAGS, 'camera');

    return results;
  }

  // --- Populate Overview Highlights ---
  function updateHighlights(metaList) {
    const metaMap = {};
    metaList.forEach(m => {
      metaMap[m.name] = m;
      metaMap[m.tagHex] = m;
    });

    // 1. Camera & Lens
    const make = metaMap['Make']?.raw || '';
    const model = metaMap['Model']?.raw || '';
    const lens = metaMap['LensModel']?.raw || metaMap['LensSpecification']?.formatted || '';

    if (make || model) {
      const fullCam = make.length && model.startsWith(make) ? model : `${make} ${model}`.trim();
      cardCamera.textContent = fullCam;
    } else {
      cardCamera.textContent = 'Camera not detected';
    }
    cardLens.textContent = lens ? `Lens: ${lens}` : 'Lens info not embedded';

    // 2. Exposure Triangle
    const expTime = metaMap['ExposureTime']?.formatted || '';
    const fnum = metaMap['FNumber']?.formatted || '';
    const iso = metaMap['ISOSpeedRatings']?.formatted || '';
    const focal = metaMap['FocalLength']?.formatted || '';

    const exposureParts = [expTime, fnum, iso].filter(Boolean);
    cardExposure.textContent = exposureParts.length ? exposureParts.join(' \u2022 ') : 'Exposure info unavailable';
    cardFocal.textContent = focal ? `Focal Length: ${focal}` : 'Focal length unavailable';

    // 3. Date & Software
    const dateTaken = metaMap['DateTimeOriginal']?.raw || metaMap['DateTime']?.raw || '';
    const software = metaMap['Software']?.raw || '';
    cardDate.textContent = dateTaken || 'Date not recorded';
    cardSoftware.textContent = software ? `Software: ${software}` : 'No software signature';

    // 4. GPS
    const latRef = metaMap['GPSLatitudeRef']?.raw || 'N';
    const latData = metaMap['GPSLatitude']?.raw;
    const lonRef = metaMap['GPSLongitudeRef']?.raw || 'E';
    const lonData = metaMap['GPSLongitude']?.raw;
    const altData = metaMap['GPSAltitude']?.formatted || '';

    if (Array.isArray(latData) && Array.isArray(lonData) && latData.length === 3 && lonData.length === 3) {
      const latDeg = (latData[0].num / latData[0].den) + (latData[1].num / latData[1].den) / 60 + (latData[2].num / latData[2].den) / 3600;
      const lonDeg = (lonData[0].num / lonData[0].den) + (lonData[1].num / lonData[1].den) / 60 + (lonData[2].num / lonData[2].den) / 3600;

      const finalLat = (latRef === 'S' ? -1 : 1) * latDeg;
      const finalLon = (lonRef === 'W' ? -1 : 1) * lonDeg;

      cardGps.textContent = `${finalLat.toFixed(5)}°, ${finalLon.toFixed(5)}°`;
      if (altData) {
        cardGps.title = altData;
      }

      linkGmaps.href = `https://www.google.com/maps?q=${finalLat},${finalLon}`;
      linkOsm.href = `https://www.openstreetmap.org/?mlat=${finalLat}&mlon=${finalLon}#map=16/${finalLat}/${finalLon}`;
      gpsLinksWrap.style.display = 'flex';
    } else {
      cardGps.textContent = 'No GPS Data Recorded';
      gpsLinksWrap.style.display = 'none';
    }
  }

  // --- Render Metadata Table ---
  function renderTable() {
    const query = tagSearch.value.trim().toLowerCase();
    metaTableBody.innerHTML = '';

    const filtered = parsedMetadata.filter(item => {
      const matchCat = (currentCategory === 'all' || item.category === currentCategory);
      if (!matchCat) return false;

      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.tagHex.toLowerCase().includes(query) ||
        String(item.formatted).toLowerCase().includes(query)
      );
    });

    if (filtered.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="4" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">
          No matching tags found for current filters.
        </td>
      `;
      metaTableBody.appendChild(emptyRow);
      return;
    }

    filtered.forEach(item => {
      const row = document.createElement('tr');
      const catBadge = item.category.toUpperCase();

      row.innerHTML = `
        <td><span class="tag-hex-pill">${item.tagHex}</span></td>
        <td class="tag-name-cell">${item.name}</td>
        <td class="tag-val-cell">${item.formatted || '<span style="opacity:0.4;">[empty]</span>'}</td>
        <td><span style="font-size: 0.725rem; font-weight: 600; text-transform: uppercase; color: var(--text-tertiary);">${catBadge}</span></td>
      `;
      metaTableBody.appendChild(row);
    });
  }

  // --- Process File Buffer ---
  function processBuffer(buffer, fileInfo = {}) {
    currentArrayBuffer = buffer;
    parsedMetadata = parseBinaryExif(buffer);

    // Update UI
    metaFilename.textContent = fileInfo.name || 'Sample Photo.jpg';
    metaFilesize.textContent = fileInfo.size ? formatBytes(fileInfo.size) : formatBytes(buffer.byteLength);
    metaMimetype.textContent = fileInfo.type || 'image/jpeg';

    metadataEmptyState.style.display = 'none';
    metadataActiveView.style.display = 'block';
    countAll.textContent = parsedMetadata.length;

    updateHighlights(parsedMetadata);
    renderTable();

    if (parsedMetadata.length === 0) {
      showToast('Photo loaded, but no EXIF metadata markers were found.');
    } else {
      showToast(`Extracted ${parsedMetadata.length} EXIF metadata tags!`);
    }
  }

  // --- Handle User Uploaded File ---
  function handleFile(file) {
    if (!file) return;
    currentFile = file;

    // Load Image for Preview
    const imgUrl = URL.createObjectURL(file);
    previewImage.onload = () => {
      previewWrapper.style.display = 'flex';
      metaDims.textContent = `${previewImage.naturalWidth} \u00D7 ${previewImage.naturalHeight} px`;
    };
    previewImage.src = imgUrl;

    const reader = new FileReader();
    reader.onload = (e) => {
      processBuffer(e.target.result, {
        name: file.name,
        size: file.size,
        type: file.type
      });
    };
    reader.readAsArrayBuffer(file);
  }

  // --- Synthesize Sample JPEG with Valid EXIF & GPS ---
  function loadSamplePhoto() {
    // 1. Create a beautiful canvas graphic (Scenic Sunset Mountain Landscape)
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, 500);
    sky.addColorStop(0, '#1e1b4b');
    sky.addColorStop(0.35, '#4c1d95');
    sky.addColorStop(0.6, '#b91c1c');
    sky.addColorStop(0.85, '#f59e0b');
    sky.addColorStop(1, '#fde68a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 800, 500);

    // Sun
    const sunGrad = ctx.createRadialGradient(400, 320, 10, 400, 320, 100);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.5, '#fde047');
    sunGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(400, 320, 100, 0, Math.PI * 2);
    ctx.fill();

    // Mountains
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(160, 340);
    ctx.lineTo(320, 420);
    ctx.lineTo(500, 310);
    ctx.lineTo(650, 400);
    ctx.lineTo(800, 280);
    ctx.lineTo(800, 500);
    ctx.closePath();
    ctx.fill();

    // Text on canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('Sample Camera Capture \u2022 Paris, France', 40, 60);

    // Convert canvas to standard JPEG
    canvas.toBlob((rawBlob) => {
      const reader = new FileReader();
      reader.onload = () => {
        const rawJpegBuffer = reader.result;

        // Build synthetic APP1 EXIF Segment
        // TIFF Header + IFD0 + Exif SubIFD + GPS SubIFD
        // Eiffel Tower Coordinates: 48° 51' 29.88" N, 2° 17' 40.2" E
        const exifSegment = buildSampleExifApp1Segment();

        // Stitch into JPEG: [SOI (2 bytes)] + [APP1 Segment] + [Rest of JPEG starting from offset 2]
        const mergedBuffer = injectApp1IntoJpeg(rawJpegBuffer, exifSegment);

        const syntheticBlob = new Blob([mergedBuffer], { type: 'image/jpeg' });
        const synthFile = new File([syntheticBlob], 'Sample_SonyA7R4_Paris.jpg', { type: 'image/jpeg' });

        handleFile(synthFile);
      };
      reader.readAsArrayBuffer(rawBlob);
    }, 'image/jpeg', 0.92);
  }

  // --- Construct Binary APP1 EXIF Block ---
  function buildSampleExifApp1Segment() {
    // Little endian (II = 0x4949)
    const buffer = new ArrayBuffer(1024);
    const view = new DataView(buffer);

    let offset = 0;
    // APP1 Marker
    view.setUint16(offset, 0xFFE1); offset += 2;
    // Length placeholder (2 bytes)
    const lenOffset = offset; offset += 2;

    // 'Exif\0\0'
    view.setUint32(offset, 0x45786966); offset += 4;
    view.setUint16(offset, 0x0000); offset += 2;

    // TIFF Header starts here (tiffStart)
    const tiffStart = offset;
    view.setUint16(offset, 0x4949); offset += 2; // II (little endian)
    view.setUint16(offset, 0x002A, true); offset += 2; // 42
    view.setUint32(offset, 8, true); offset += 4; // First IFD offset (8 from tiffStart)

    // --- IFD0 ---
    // Start of IFD0 is at tiffStart + 8
    const ifd0Start = offset;
    const ifd0EntriesCount = 7;
    view.setUint16(offset, ifd0EntriesCount, true); offset += 2;

    // Helper to store ascii string in data area
    let dataOffset = ifd0Start + 2 + ifd0EntriesCount * 12 + 4; // after IFD0 entries & next IFD ptr
    // Leave room for ExifIFD (around 80 bytes) and GPSIFD (around 60 bytes)
    const exifIfdOffset = 180;
    const gpsIfdOffset = 360;
    dataOffset = 520;

    function writeAscii(str) {
      const ptr = dataOffset;
      for (let i = 0; i < str.length; i++) {
        view.setUint8(tiffStart + dataOffset++, str.charCodeAt(i));
      }
      view.setUint8(tiffStart + dataOffset++, 0); // null term
      return ptr;
    }

    function writeRational(num, den) {
      const ptr = dataOffset;
      view.setUint32(tiffStart + dataOffset, num, true); dataOffset += 4;
      view.setUint32(tiffStart + dataOffset, den, true); dataOffset += 4;
      return ptr;
    }

    // Tag 1: Make (0x010F)
    const makePtr = writeAscii('Sony');
    view.setUint16(offset, 0x010F, true); offset += 2;
    view.setUint16(offset, 2, true); offset += 2; // ASCII
    view.setUint32(offset, 5, true); offset += 4; // count
    view.setUint32(offset, makePtr, true); offset += 4;

    // Tag 2: Model (0x0110)
    const modelPtr = writeAscii('ILCE-7RM4');
    view.setUint16(offset, 0x0110, true); offset += 2;
    view.setUint16(offset, 2, true); offset += 2;
    view.setUint32(offset, 10, true); offset += 4;
    view.setUint32(offset, modelPtr, true); offset += 4;

    // Tag 3: Orientation (0x0112)
    view.setUint16(offset, 0x0112, true); offset += 2;
    view.setUint16(offset, 3, true); offset += 2; // SHORT
    view.setUint32(offset, 1, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2; // Normal (1)
    view.setUint16(offset, 0, true); offset += 2;

    // Tag 4: Software (0x0131)
    const softPtr = writeAscii('Adobe Lightroom 13.2 (Macintosh)');
    view.setUint16(offset, 0x0131, true); offset += 2;
    view.setUint16(offset, 2, true); offset += 2;
    view.setUint32(offset, 33, true); offset += 4;
    view.setUint32(offset, softPtr, true); offset += 4;

    // Tag 5: DateTime (0x0132)
    const datePtr = writeAscii('2024:05:18 14:23:45');
    view.setUint16(offset, 0x0132, true); offset += 2;
    view.setUint16(offset, 2, true); offset += 2;
    view.setUint32(offset, 20, true); offset += 4;
    view.setUint32(offset, datePtr, true); offset += 4;

    // Tag 6: ExifIFDPointer (0x8769)
    view.setUint16(offset, 0x8769, true); offset += 2;
    view.setUint16(offset, 4, true); offset += 2; // LONG
    view.setUint32(offset, 1, true); offset += 4;
    view.setUint32(offset, exifIfdOffset, true); offset += 4;

    // Tag 7: GPSInfoIFDPointer (0x8825)
    view.setUint16(offset, 0x8825, true); offset += 2;
    view.setUint16(offset, 4, true); offset += 2; // LONG
    view.setUint32(offset, 1, true); offset += 4;
    view.setUint32(offset, gpsIfdOffset, true); offset += 4;

    // End of IFD0
    view.setUint32(offset, 0, true); // No IFD1

    // --- Exif SubIFD (at tiffStart + exifIfdOffset) ---
    let eOffset = tiffStart + exifIfdOffset;
    const exifEntriesCount = 8;
    view.setUint16(eOffset, exifEntriesCount, true); eOffset += 2;

    // ExposureTime (0x829A) -> 1/500
    const expPtr = writeRational(1, 500);
    view.setUint16(eOffset, 0x829A, true); eOffset += 2;
    view.setUint16(eOffset, 5, true); eOffset += 2; // RATIONAL
    view.setUint32(eOffset, 1, true); eOffset += 4;
    view.setUint32(eOffset, expPtr, true); eOffset += 4;

    // FNumber (0x829D) -> 2.8 = 28/10
    const fPtr = writeRational(28, 10);
    view.setUint16(eOffset, 0x829D, true); eOffset += 2;
    view.setUint16(eOffset, 5, true); eOffset += 2;
    view.setUint32(eOffset, 1, true); eOffset += 4;
    view.setUint32(eOffset, fPtr, true); eOffset += 4;

    // ExposureProgram (0x8822) -> Aperture Priority (3)
    view.setUint16(eOffset, 0x8822, true); eOffset += 2;
    view.setUint16(eOffset, 3, true); eOffset += 2;
    view.setUint32(eOffset, 1, true); eOffset += 4;
    view.setUint16(eOffset, 3, true); eOffset += 2;
    view.setUint16(eOffset, 0, true); eOffset += 2;

    // ISOSpeedRatings (0x8827) -> 100
    view.setUint16(eOffset, 0x8827, true); eOffset += 2;
    view.setUint16(eOffset, 3, true); eOffset += 2;
    view.setUint32(eOffset, 1, true); eOffset += 4;
    view.setUint16(eOffset, 100, true); eOffset += 2;
    view.setUint16(eOffset, 0, true); eOffset += 2;

    // DateTimeOriginal (0x9003)
    view.setUint16(eOffset, 0x9003, true); eOffset += 2;
    view.setUint16(eOffset, 2, true); eOffset += 2;
    view.setUint32(eOffset, 20, true); eOffset += 4;
    view.setUint32(eOffset, datePtr, true); eOffset += 4;

    // FocalLength (0x920A) -> 35mm
    const flPtr = writeRational(350, 10);
    view.setUint16(eOffset, 0x920A, true); eOffset += 2;
    view.setUint16(eOffset, 5, true); eOffset += 2;
    view.setUint32(eOffset, 1, true); eOffset += 4;
    view.setUint32(eOffset, flPtr, true); eOffset += 4;

    // FocalLengthIn35mmFilm (0xA405) -> 35
    view.setUint16(eOffset, 0xA405, true); eOffset += 2;
    view.setUint16(eOffset, 3, true); eOffset += 2;
    view.setUint32(eOffset, 1, true); eOffset += 4;
    view.setUint16(eOffset, 35, true); eOffset += 2;
    view.setUint16(eOffset, 0, true); eOffset += 2;

    // LensModel (0xA434)
    const lensPtr = writeAscii('FE 24-70mm F2.8 GM II');
    view.setUint16(eOffset, 0xA434, true); eOffset += 2;
    view.setUint16(eOffset, 2, true); eOffset += 2;
    view.setUint32(eOffset, 22, true); eOffset += 4;
    view.setUint32(eOffset, lensPtr, true); eOffset += 4;

    // --- GPS SubIFD (at tiffStart + gpsIfdOffset) ---
    let gOffset = tiffStart + gpsIfdOffset;
    const gpsEntriesCount = 6;
    view.setUint16(gOffset, gpsEntriesCount, true); gOffset += 2;

    // GPSLatitudeRef (0x0001) -> 'N'
    view.setUint16(gOffset, 0x0001, true); gOffset += 2;
    view.setUint16(gOffset, 2, true); gOffset += 2;
    view.setUint32(gOffset, 2, true); gOffset += 4;
    view.setUint8(gOffset, 'N'.charCodeAt(0));
    view.setUint8(gOffset + 1, 0); gOffset += 4;

    // GPSLatitude (0x0002) -> 48 deg, 51 min, 29.88 sec
    const latPtr = dataOffset;
    view.setUint32(tiffStart + dataOffset, 48, true); dataOffset += 4;
    view.setUint32(tiffStart + dataOffset, 1, true); dataOffset += 4;
    view.setUint32(tiffStart + dataOffset, 51, true); dataOffset += 4;
    view.setUint32(tiffStart + dataOffset, 1, true); dataOffset += 4;
    view.setUint32(tiffStart + dataOffset, 2988, true); dataOffset += 4;
    view.setUint32(tiffStart + dataOffset, 100, true); dataOffset += 4;

    view.setUint16(gOffset, 0x0002, true); gOffset += 2;
    view.setUint16(gOffset, 5, true); gOffset += 2;
    view.setUint32(gOffset, 3, true); gOffset += 4;
    view.setUint32(gOffset, latPtr, true); gOffset += 4;

    // GPSLongitudeRef (0x0003) -> 'E'
    view.setUint16(gOffset, 0x0003, true); gOffset += 2;
    view.setUint16(gOffset, 2, true); gOffset += 2;
    view.setUint32(gOffset, 2, true); gOffset += 4;
    view.setUint8(gOffset, 'E'.charCodeAt(0));
    view.setUint8(gOffset + 1, 0); gOffset += 4;

    // GPSLongitude (0x0004) -> 2 deg, 17 min, 40.2 sec
    const lonPtr = dataOffset;
    view.setUint32(tiffStart + dataOffset, 2, true); dataOffset += 4;
    view.setUint32(tiffStart + dataOffset, 1, true); dataOffset += 4;
    view.setUint32(tiffStart + dataOffset, 17, true); dataOffset += 4;
    view.setUint32(tiffStart + dataOffset, 1, true); dataOffset += 4;
    view.setUint32(tiffStart + dataOffset, 402, true); dataOffset += 4;
    view.setUint32(tiffStart + dataOffset, 10, true); dataOffset += 4;

    view.setUint16(gOffset, 0x0004, true); gOffset += 2;
    view.setUint16(gOffset, 5, true); gOffset += 2;
    view.setUint32(gOffset, 3, true); gOffset += 4;
    view.setUint32(gOffset, lonPtr, true); gOffset += 4;

    // GPSAltitudeRef (0x0005) -> 0 (above sea level)
    view.setUint16(gOffset, 0x0005, true); gOffset += 2;
    view.setUint16(gOffset, 1, true); gOffset += 2;
    view.setUint32(gOffset, 1, true); gOffset += 4;
    view.setUint8(gOffset, 0); gOffset += 4;

    // GPSAltitude (0x0006) -> 324m (Eiffel Tower summit)
    const altPtr = writeRational(324, 1);
    view.setUint16(gOffset, 0x0006, true); gOffset += 2;
    view.setUint16(gOffset, 5, true); gOffset += 2;
    view.setUint32(gOffset, 1, true); gOffset += 4;
    view.setUint32(gOffset, altPtr, true); gOffset += 4;

    // Set Total Length in APP1 header: (total payload bytes including 2 bytes of length)
    const totalApp1Length = (tiffStart + dataOffset) - lenOffset;
    view.setUint16(lenOffset, totalApp1Length);

    return buffer.slice(0, tiffStart + dataOffset);
  }

  // Inject APP1 marker into clean JPEG buffer
  function injectApp1IntoJpeg(jpegBuffer, app1Buffer) {
    const rawBytes = new Uint8Array(jpegBuffer);
    const app1Bytes = new Uint8Array(app1Buffer);

    // [SOI: 2 bytes] + [APP1 Segment] + [Original bytes after SOI]
    const merged = new Uint8Array(2 + app1Bytes.byteLength + (rawBytes.byteLength - 2));
    merged.set(rawBytes.subarray(0, 2), 0);
    merged.set(app1Bytes, 2);
    merged.set(rawBytes.subarray(2), 2 + app1Bytes.byteLength);

    return merged.buffer;
  }

  // --- Privacy Tool: Strip EXIF and Download Clean Photo ---
  btnStripExif.addEventListener('click', () => {
    if (!previewImage.src) return;

    const canvas = document.createElement('canvas');
    canvas.width = previewImage.naturalWidth;
    canvas.height = previewImage.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(previewImage, 0, 0);

    // Re-encode to clean JPEG without metadata
    canvas.toBlob((blob) => {
      const link = document.createElement('a');
      const baseName = (metaFilename.textContent || 'photo').replace(/\.[^/.]+$/, '');
      link.download = `${baseName}_clean_no_exif.jpg`;
      link.href = URL.createObjectURL(blob);
      link.click();
      showToast('Clean photo downloaded (All EXIF metadata stripped)!');
    }, 'image/jpeg', 0.95);
  });

  // --- Export Actions ---
  btnCopyJson.addEventListener('click', async () => {
    if (parsedMetadata.length === 0) return;
    const jsonDict = {};
    parsedMetadata.forEach(item => {
      jsonDict[item.name] = {
        tagHex: item.tagHex,
        category: item.category,
        value: item.formatted,
        raw: item.raw
      };
    });

    const jsonStr = JSON.stringify(jsonDict, null, 2);
    try {
      await navigator.clipboard.writeText(jsonStr);
      showToast('Metadata JSON copied to clipboard!');
    } catch {
      showToast('Copied JSON!');
    }
  });

  btnDownloadJson.addEventListener('click', () => {
    if (parsedMetadata.length === 0) return;
    const jsonDict = {};
    parsedMetadata.forEach(item => {
      jsonDict[item.name] = {
        tagHex: item.tagHex,
        category: item.category,
        value: item.formatted,
        raw: item.raw
      };
    });

    const jsonStr = JSON.stringify(jsonDict, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `exif-metadata-${Date.now()}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    showToast('Exported EXIF JSON file!');
  });

  // --- Event Listeners ---
  browseBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  btnLoadSample.addEventListener('click', () => {
    loadSamplePhoto();
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // Category filter tabs
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-cat');
      renderTable();
    });
  });

  // Search input
  tagSearch.addEventListener('input', () => {
    renderTable();
  });

  // Load sample photo initially so tool is immediately populated and engaging!
  loadSamplePhoto();
});