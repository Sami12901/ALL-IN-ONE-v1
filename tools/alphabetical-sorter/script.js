document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const sortType = document.getElementById('sort-type');
    const caseSensitive = document.getElementById('case-sensitive');
    const removeEmpty = document.getElementById('remove-empty');
    const removeDuplicates = document.getElementById('remove-duplicates');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');

    const performSort = () => {
        if (!inputText.value && !outputText.value) return;

        let lines = inputText.value.split('\n');

        if (removeEmpty.checked) {
            lines = lines.filter(line => line.trim() !== '');
        }

        if (removeDuplicates.checked) {
            if (caseSensitive.checked) {
                lines = [...new Set(lines)];
            } else {
                const seen = new Set();
                lines = lines.filter(line => {
                    const lower = line.toLowerCase();
                    if (seen.has(lower)) return false;
                    seen.add(lower);
                    return true;
                });
            }
        }

        const type = sortType.value;
        const isCaseSensitive = caseSensitive.checked;

        switch (type) {
            case 'alpha-asc':
                lines.sort((a, b) => compareAlpha(a, b, isCaseSensitive, 1));
                break;
            case 'alpha-desc':
                lines.sort((a, b) => compareAlpha(a, b, isCaseSensitive, -1));
                break;
            case 'num-asc':
                lines.sort((a, b) => compareNum(a, b, 1));
                break;
            case 'num-desc':
                lines.sort((a, b) => compareNum(a, b, -1));
                break;
            case 'length-asc':
                lines.sort((a, b) => a.length - b.length || compareAlpha(a, b, isCaseSensitive, 1));
                break;
            case 'length-desc':
                lines.sort((a, b) => b.length - a.length || compareAlpha(a, b, isCaseSensitive, 1));
                break;
            case 'random':
                for (let i = lines.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [lines[i], lines[j]] = [lines[j], lines[i]];
                }
                break;
            case 'reverse':
                lines.reverse();
                break;
        }

        outputText.value = lines.join('\n');
    };

    const compareAlpha = (a, b, isCaseSensitive, dir) => {
        if (!isCaseSensitive) {
            a = a.toLowerCase();
            b = b.toLowerCase();
        }
        if (a < b) return -1 * dir;
        if (a > b) return 1 * dir;
        return 0;
    };

    const compareNum = (a, b, dir) => {
        const numA = parseFloat(a.replace(/[^0-9.-]/g, '')) || 0;
        const numB = parseFloat(b.replace(/[^0-9.-]/g, '')) || 0;
        return (numA - numB) * dir;
    };

    inputText.addEventListener('input', performSort);
    sortType.addEventListener('change', performSort);
    caseSensitive.addEventListener('change', performSort);
    removeEmpty.addEventListener('change', performSort);
    removeDuplicates.addEventListener('change', performSort);

    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
    });

    copyBtn.addEventListener('click', () => {
        if (!outputText.value) return;
        navigator.clipboard.writeText(outputText.value).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        });
    });

    if (inputText.value) {
        performSort();
    }
});