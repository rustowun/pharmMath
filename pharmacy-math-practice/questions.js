/* All values follow the supplied study guide. No network or libraries required. */
(() => {
  'use strict';
  const bank = [];
  const topics = {metric:'Metric conversions',household:'Household measures',weight:'Pounds & kilograms',dose:'Dose calculations',fractions:'Fractions & decimals',reasoning:'Rules & error spotting'};
  const formatNumber = n => Number(n.toFixed(8)).toLocaleString('en-US',{maximumFractionDigits:8});
  function numeric(topic,prompt,answer,unit,explanation,memory) {
    bank.push({id:`q${bank.length+1}`,topic,prompt,answer:Number(answer.toFixed(8)),unit,explanation,memory,type:'numeric'});
  }
  function concept(prompt,choices,index,explanation,memory='Match units, calculate, then check the size of your answer.') {
    bank.push({id:`q${bank.length+1}`,topic:'reasoning',prompt,choices,answer:choices[index],explanation,memory,type:'concept'});
  }
  const conversions = [
    ['metric','kg','g',1000,[0.5,1.2,2,0.075]],
    ['metric','g','kg',0.001,[500,1250,2500,75]],
    ['metric','g','mg',1000,[2,3,0.5,0.75]],
    ['metric','mg','g',0.001,[500,1250,250,75]],
    ['metric','mg','mcg',1000,[0.6,0.25,2,0.08]],
    ['metric','mcg','mg',0.001,[250,400,1500,75]],
    ['metric','g','mcg',1000000,[0.004,0.002,0.0005,0.012]],
    ['metric','mcg','g',0.000001,[4000,2000,750,12000]],
    ['metric','L','mL',1000,[1.5,2.25,0.08,0.625]],
    ['metric','mL','L',0.001,[750,85,1250,250]],
    ['household','tsp','mL',5,[2,3,0.5,4]],
    ['household','mL','tsp',0.2,[10,15,2.5,20]],
    ['household','tbsp','mL',15,[1,2,0.5,3]],
    ['household','mL','tbsp',1/15,[15,30,7.5,45]],
    ['household','tbsp','tsp',3,[1,2,0.5,3]],
    ['household','fl oz','mL',30,[1,2,0.5,3]],
    ['household','mL','fl oz',1/30,[30,60,90,120]],
    ['household','cup','mL',240,[1,0.5,0.25,1.5]],
    ['household','mL','cup',1/240,[240,120,60,360]],
    ['weight','lb','kg',1/2.2,[154,176,110,198]],
    ['weight','kg','lb',2.2,[70,45,50,90]]
  ];
  for(const [topic,from,to,factor,values] of conversions) {
    for(const value of values) {
      const answer=value*factor;
      let factorText = factor>=1 ? `multiply by ${formatNumber(factor)}` : `divide by ${formatNumber(1/factor)}`;
      let calculation = factor>=1 ? `${formatNumber(value)} × ${formatNumber(factor)}` : `${formatNumber(value)} ÷ ${formatNumber(1/factor)}`;
      const approx=topic==='weight'||['fl oz','cup'].includes(from)||['fl oz','cup'].includes(to);
      const note=approx?' This uses the rounded study-guide factor.':'';
      const memory=topic==='weight'?'Pounds are plentiful: the pounds number is larger.':topic==='household'?'Tea is 5; table is triple. Use 30 mL/fl oz and 240 mL/cup for these exercises.':'Small units, big count. Each step on kg → g → mg → mcg is a factor of 1,000.';
      numeric(topic,`Convert ${formatNumber(value)} ${from} to ${to}.`,answer,to,`To convert ${from} to ${to}, ${factorText}. ${calculation} = ${formatNumber(answer)} ${to}.${note}`,memory);
    }
  }
  for(const [d,h] of [[500,250],[750,250],[100,50],[600,200]])numeric('dose',`Ordered: ${d} mg. Available: ${h} mg per tablet. How many tablets?`,d/h,'tablets',`D / H × Q = (${d} mg / ${h} mg) × 1 tablet = ${d/h} tablets. Check: ${d/h} × ${h} mg = ${d} mg.`,'Want over got, times the quantity.');
  for(const [d,h,q] of [[250,125,5],[300,150,5],[75,150,5],[125,250,5],[450,150,5],[240,80,2],[60,120,5],[180,60,2]])numeric('dose',`Ordered: ${d} mg. Available: ${h} mg per ${q} mL. How many mL?`,d/h*q,'mL',`D / H × Q = (${d} / ${h}) × ${q} = ${formatNumber(d/h*q)} mL. Check: ${formatNumber(d/h*q)} mL × ${formatNumber(h/q)} mg/mL = ${d} mg.`,'Do not forget Q: use the volume printed with the available dose.');
  for(const [g,h] of [[0.5,250],[0.75,250],[0.2,100],[1.2,400]])numeric('dose',`Ordered: ${g} g. Available: ${h} mg per tablet. How many tablets?`,g*1000/h,'tablets',`Convert first: ${g} g × 1,000 = ${formatNumber(g*1000)} mg. Then (${formatNumber(g*1000)} / ${h}) × 1 = ${formatNumber(g*1000/h)} tablets.`,'D and H must use the same units.');
  for(const [mg,mcg] of [[0.2,100],[0.15,50],[0.5,250],[0.3,100]])numeric('dose',`Ordered: ${mg} mg. Available: ${mcg} mcg per tablet. How many tablets?`,mg*1000/mcg,'tablets',`Convert ${mg} mg × 1,000 = ${mg*1000} mcg. Then (${mg*1000} / ${mcg}) × 1 = ${formatNumber(mg*1000/mcg)} tablets.`,'Convert first, then use D / H × Q.');
  for(const [mg,ml] of [[125,5],[200,5],[150,5],[120,2]])numeric('dose',`A liquid contains ${mg} mg per ${ml} mL. What is its concentration in mg/mL?`,mg/ml,'mg/mL',`${mg} mg ÷ ${ml} mL = ${mg/ml} mg/mL. This is the amount of medicine in each 1 mL.`,'Concentration connects mass (mg) to volume (mL).');
  for(const [mg,ml,vol] of [[100,5,10],[125,5,4],[150,5,2],[200,5,7.5]])numeric('dose',`A liquid contains ${mg} mg per ${ml} mL. How many mg are in ${vol} mL?`,mg/ml*vol,'mg',`First: ${mg} / ${ml} = ${mg/ml} mg/mL. Then ${mg/ml} mg/mL × ${vol} mL = ${mg/ml*vol} mg.`,'To find the mass, multiply concentration by volume.');
  for(const [fraction,value] of [['1/2',0.5],['1/4',0.25],['3/4',0.75]]) {
    numeric('fractions',`Write ${fraction} as a decimal.`,value,'decimal',`${fraction.replace('/',' ÷ ')} = ${value}.`,'Half = 0.5; a quarter = 0.25; three quarters = 0.75.');
    numeric('fractions',`Convert ${fraction} g to mg.`,value*1000,'mg',`${fraction} = ${value}. Then ${value} g × 1,000 = ${value*1000} mg.`,'Change the fraction to a decimal, then convert the unit.');
  }
  concept('Which order goes from the largest mass unit to the smallest?',['kg → g → mg → mcg','mcg → mg → g → kg','kg → mg → g → mcg','g → kg → mcg → mg'],0,'The ladder is kg → g → mg → mcg. Each step right multiplies the number by 1,000.','Kind Giants Make Muffins: Kilo, Gram, Milli, Micro.');
  concept('When you convert to a smaller unit, what happens to the number?',['It gets bigger.','It gets smaller.','It stays the same.','It always becomes a decimal.'],0,'More small units are needed to represent the same amount. For example, 1 g = 1,000 mg.','Small units, big count.');
  concept('A student writes “0.5 g = 0.0005 mg.” What is the correct answer?',['500 mg','0.0005 mg','5 mg','0.05 mg'],0,'Grams to milligrams multiplies by 1,000: 0.5 × 1,000 = 500 mg. The student divided instead.');
  concept('For 250 mg from a liquid labeled 125 mg per 5 mL, a student answers 2 mL. What was missed?',['Multiply the dose ratio by 5 mL.','Divide the result by 5 mL.','Convert mg to g only.','Nothing; 2 mL is correct.'],0,'250 / 125 = 2 portions. Each portion is 5 mL, so 2 × 5 = 10 mL.','Want over got, times the quantity.');
  concept('Is 500 mg always equal to 5 mL?',['No; you need the concentration.','Yes; mg and mL are interchangeable.','Yes; divide any mg amount by 100.','No; 500 mg always equals 0.5 mL.'],0,'mg measures mass; mL measures volume. A label such as 100 mg/mL is needed to connect them.');
  concept('What must you do before dividing Desired by Have?',['Make their dose units match.','Convert every amount to liters.','Round both numbers to whole numbers.','Multiply Desired by Quantity twice.'],0,'Desired and Have must use the same dose units. Convert g to mg or mg to mcg first when needed.');
  concept('The label is 125 mg per 5 mL. What is Q in D / H × Q?',['5 mL','125 mg','1 mL','The ordered dose'],0,'Q is the volume or number of dosage units containing H. Here, 125 mg is contained in 5 mL.');
  concept('Which is the recommended way to write a dose of half a milligram?',['0.5 mg','.5 mg','00.50 mg','0.50 mg'],0,'Use a leading zero before the decimal and omit unnecessary trailing zeros: 0.5 mg.');
  concept('Which is the recommended way to write a dose of five milligrams?',['5 mg','5.0 mg','5.00 mg','05.0 mg'],0,'Avoid unnecessary trailing zeros after a decimal: write 5 mg.');
  concept('When should rounding happen in these calculations?',['At the end, using the required rule.','After every multiplication.','Before converting units.','Always to the nearest whole number.'],0,'Keep full precision while calculating. Round only at the end as instructed. The numeric questions here need no rounding.');
  concept('For the same weight, which number is larger?',['Pounds','Kilograms','They are equal.','It depends on the person.'],0,'1 kg is about 2.2 lb. Therefore, the pounds number is larger for the same weight.','Pounds are plentiful.');
  concept('What does “Tea is 5; table is triple” help you remember?',['1 tsp = 5 mL; 1 tbsp = 15 mL','1 tsp = 15 mL; 1 tbsp = 5 mL','1 tsp = 3 mL; 1 tbsp = 5 mL','1 tsp = 5 mL; 1 tbsp = 10 mL'],0,'One tablespoon is 3 teaspoons: 3 × 5 mL = 15 mL. These are the guide’s study conventions.');
  concept('Which unit measures volume rather than mass?',['mL','mg','mcg','g'],0,'Milliliters measure volume. Grams, milligrams, and micrograms measure mass.');
  concept('What does fl oz measure?',['Volume','Mass','Concentration','Number of tablets'],0,'A fluid ounce is a volume unit. Do not confuse it with an ounce of weight.');
  concept('Moving from g to mcg takes two ladder steps. What factor do you use?',['Multiply by 1,000,000','Multiply by 2,000','Divide by 1,000','Multiply by 100'],0,'g → mg multiplies by 1,000, and mg → mcg multiplies by another 1,000. Total: 1,000 × 1,000 = 1,000,000.');
  concept('Which check confirms 500 mg / 250 mg per tablet = 2 tablets?',['2 tablets × 250 mg/tablet = 500 mg','2 tablets / 250 mg = 0.008','500 mg × 250 mg = 125,000','2 tablets = 2 mg'],0,'Multiply the answer by the strength per tablet to recover the ordered dose.');
  concept('Which setup correctly cancels grams when converting 2 g to mg?',['2 g × (1,000 mg / 1 g)','2 g × (1 g / 1,000 mg)','2 g + 1,000 mg','2 g / (1,000 mg / 1 g)'],0,'Put the starting unit on the bottom of the conversion factor. Grams cancel, leaving 2,000 mg.');
  concept('Which tool should be used to measure liquid medicine?',['An appropriate calibrated dosing device','A household kitchen spoon','Any drinking cup','A spoon chosen by its size'],0,'Use an appropriate calibrated dosing device with markings matching the instructions, not a household spoon.');
  concept('In the SAME checklist, what does A stand for?',['Align units before dose math.','Always multiply.','Add the available dose.','Avoid decimals.'],0,'S: State the units. A: Align units. M: Multiply or divide. E: Evaluate and check in reverse.');
  concept('Which study routine best matches this guide?',['Recall conversions, solve problems, check size, finish with dose math.','Read answers without solving problems.','Memorize numbers without units.','Round all doses before starting.'],0,'Active recall plus written calculations and a reasonableness check helps you find gaps. Include D / H × Q practice.');
  const parseNumber = text => {
    const s=String(text).trim();
    if(/^\d+\s*\/\s*\d+$/.test(s)){const [a,b]=s.split('/').map(Number);return b? a/b:null;}
    if(!/^(?:\d{1,3}(?:,\d{3})+|\d+|)(?:\.\d+)?$/.test(s)||!s)return null;
    const n=Number(s.replace(/,/g,''));return Number.isFinite(n)?n:null;
  };
  const isCorrect = (q,value) => q.type==='concept'?value===q.answer:typeof value==='number'&&Math.abs(value-q.answer)<1e-9;
  globalThis.Pharmacy={bank,topics,formatNumber,parseNumber,isCorrect};
})();
