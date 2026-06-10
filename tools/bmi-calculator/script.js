// BMI Calculator Logic
document.addEventListener('DOMContentLoaded', () => {
  const weightSlider = document.getElementById('weight');
  const weightVal = document.getElementById('weight-val');
  const heightSlider = document.getElementById('height');
  const heightVal = document.getElementById('height-val');
  const weightLabel = document.getElementById('weight-label');
  const heightLabel = document.getElementById('height-label');

  const unitMetric = document.getElementById('unit-metric');
  const unitImperial = document.getElementById('unit-imperial');

  const bmiScore = document.getElementById('bmi-score');
  const bmiBadge = document.getElementById('bmi-badge');
  const bmiDesc = document.getElementById('bmi-desc');

  let activeUnit = 'metric';

  function updateUnitLayout() {
    if (activeUnit === 'metric') {
      unitMetric.className = 'btn btn-primary';
      unitImperial.className = 'btn btn-secondary';

      weightSlider.min = 30;
      weightSlider.max = 150;
      weightSlider.value = 70;

      heightSlider.min = 100;
      heightSlider.max = 220;
      heightSlider.value = 170;
    } else {
      unitMetric.className = 'btn btn-secondary';
      unitImperial.className = 'btn btn-primary';

      weightSlider.min = 60;
      weightSlider.max = 330;
      weightSlider.value = 150; // lbs

      heightSlider.min = 36;
      heightSlider.max = 84;
      heightSlider.value = 68; // inches
    }
    calculateBMI();
  }

  function calculateBMI() {
    const weight = parseFloat(weightSlider.value);
    const height = parseFloat(heightSlider.value);
    
    let bmi = 0;

    if (activeUnit === 'metric') {
      weightVal.textContent = `${weight} kg`;
      heightVal.textContent = `${height} cm`;
      bmi = weight / Math.pow(height / 100, 2);
    } else {
      weightVal.textContent = `${weight} lbs`;
      
      const feet = Math.floor(height / 12);
      const inches = Math.round(height % 12);
      heightVal.textContent = `${feet}ft ${inches}in`;
      
      bmi = (weight * 703) / Math.pow(height, 2);
    }

    const score = bmi.toFixed(1);
    bmiScore.textContent = score;

    let category = 'Normal Weight';
    let color = 'var(--success)';
    let desc = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'var(--warning)';
      desc = 'A BMI below 18.5 indicates you are underweight. Consider consulting a nutritionist to explore healthy calorie adjustments.';
    } else if (bmi < 25) {
      category = 'Normal Weight';
      color = 'var(--success)';
      desc = 'A BMI between 18.5 and 24.9 is within the optimal healthy weight zone. Keep up the balanced diet and active lifestyle!';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'var(--warning)';
      desc = 'A BMI between 25 and 29.9 indicates an overweight range. Modest adjustments in physical activities can help balance your scale.';
    } else {
      category = 'Obese';
      color = 'var(--error)';
      desc = 'A BMI of 30 or higher indicates obesity. Consider seeking medical guidance to establish positive health goals.';
    }

    bmiBadge.textContent = category;
    bmiBadge.style.backgroundColor = color;
    bmiDesc.textContent = desc;
  }

  weightSlider.addEventListener('input', calculateBMI);
  heightSlider.addEventListener('input', calculateBMI);

  unitMetric.addEventListener('click', () => { activeUnit = 'metric'; updateUnitLayout(); });
  unitImperial.addEventListener('click', () => { activeUnit = 'imperial'; updateUnitLayout(); });

  updateUnitLayout();
});