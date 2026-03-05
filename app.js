(function () {
  const DBP_TYPES = ['thms', 'haas', 'hans', 'others'];
  const DBP_CLASS = { thms: 'thm', haas: 'haa', hans: 'han', others: 'others' };

  function getSelections() {
    return {
      organic: document.querySelector('input[name="organic"]:checked')?.value ?? 'medium',
      additional: document.querySelector('input[name="additional"]:checked')?.value ?? 'bromine',
      primary: document.querySelector('input[name="primary"]:checked')?.value ?? 'chlorine',
      residual: document.querySelector('input[name="residual"]:checked')?.value ?? 'chloramine',
      travel: document.querySelector('input[name="travel"]:checked')?.value ?? 'high',
    };
  }

  function computeCounts(selections) {
    const organicMult = { low: 0.5, medium: 1, high: 1.5 }[selections.organic] ?? 1;
    const addBias = {
      bromine: { thms: 2, haas: 1, hans: 0, others: 0 },
      fluorine: { thms: 0, haas: 2, hans: 1, others: 0 },
      iodine: { thms: 1, haas: 0, hans: 2, others: 1 },
      nitrogen: { thms: 0, haas: 1, hans: 2, others: 1 },
    }[selections.additional] ?? { thms: 1, haas: 1, hans: 1, others: 1 };
    const primaryBias = {
      chlorine: { thms: 2, haas: 1, hans: 0, others: 0 },
      chloramine: { thms: 0.5, haas: 2, hans: 1.5, others: 1 },
      other: { thms: 1, haas: 1, hans: 1, others: 2 },
    }[selections.primary] ?? { thms: 1, haas: 1, hans: 1, others: 1 };
    const travelMult = { low: 0.6, medium: 1, high: 1.4 }[selections.travel] ?? 1;
    const residualBias = {
      chlorine: { thms: 1.2, haas: 0.8, hans: 0.5, others: 0.5 },
      chloramine: { thms: 0.6, haas: 1, hans: 1.2, others: 1.2 },
    }[selections.residual] ?? { thms: 1, haas: 1, hans: 1, others: 1 };

    function round(x) {
      return Math.max(0, Math.round(x));
    }

    const baseSource = { thms: 1, haas: 0, hans: 0, others: 0 };
    const source = {
      thms: round((baseSource.thms + addBias.thms * 0.5) * organicMult),
      haas: round((baseSource.haas + addBias.haas * 0.5) * organicMult),
      hans: round((baseSource.hans + addBias.hans * 0.5) * organicMult),
      others: round((baseSource.others + addBias.others * 0.5) * organicMult),
    };

    const baseTreatment = { thms: 2, haas: 1, hans: 0, others: 0 };
    const treatment = {
      thms: round((baseTreatment.thms * primaryBias.thms + addBias.thms) * organicMult),
      haas: round((baseTreatment.haas * primaryBias.haas + addBias.haas) * organicMult),
      hans: round((baseTreatment.hans * primaryBias.hans + addBias.hans) * organicMult),
      others: round((baseTreatment.others * primaryBias.others + addBias.others) * organicMult),
    };

    const baseDist = { thms: 3, haas: 2, hans: 1, others: 1 };
    const dist = {
      thms: round((baseDist.thms * primaryBias.thms * residualBias.thms + addBias.thms) * organicMult * travelMult),
      haas: round((baseDist.haas * primaryBias.haas * residualBias.haas + addBias.haas) * organicMult * travelMult),
      hans: round((baseDist.hans * primaryBias.hans * residualBias.hans + addBias.hans) * organicMult * travelMult),
      others: round((baseDist.others * primaryBias.others * residualBias.others + addBias.others) * organicMult * travelMult),
    };

    return { source, treatment, distribution: dist };
  }

  function createDbpShape(type, leftPct, topPct, size) {
    const el = document.createElement('div');
    el.className = 'dbp-shape ' + type;
    el.style.left = leftPct + '%';
    el.style.top = topPct + '%';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.marginLeft = -size / 2 + 'px';
    el.style.marginTop = -size / 2 + 'px';
    return el;
  }

  function renderColumn(containerId, counts) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const rect = container.getBoundingClientRect();
    const padding = 20;
    const minSize = 10;
    const maxSize = 18;

    const shapes = [];
    DBP_TYPES.forEach(function (key) {
      const n = counts[key] ?? 0;
      for (let i = 0; i < n; i++) {
        shapes.push({ key });
      }
    });

    shapes.forEach(function (s) {
      const leftPct = padding + Math.random() * (100 - 2 * padding);
      const topPct = padding + Math.random() * (100 - 2 * padding);
      const size = minSize + Math.random() * (maxSize - minSize);
      const el = createDbpShape(DBP_CLASS[s.key], leftPct, topPct, size);
      container.appendChild(el);
    });
  }

  // Which stages need re-render when a given input name changes (downstream dependency)
  const inputToStages = {
    organic: ['source', 'treatment', 'distribution'],
    additional: ['source', 'treatment', 'distribution'],
    primary: ['treatment', 'distribution'],
    residual: ['distribution'],
    travel: ['distribution'],
  };

  function update(affectedStages) {
    const selections = getSelections();
    const counts = computeCounts(selections);
    const stages = affectedStages || ['source', 'treatment', 'distribution'];
    const containerMap = { source: 'dbp-source', treatment: 'dbp-treatment', distribution: 'dbp-distribution' };
    stages.forEach(function (stage) {
      renderColumn(containerMap[stage], counts[stage]);
    });
  }

  document.querySelectorAll('input[type="radio"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      const stages = inputToStages[radio.name] || ['source', 'treatment', 'distribution'];
      update(stages);
    });
  });

  update();
})();
