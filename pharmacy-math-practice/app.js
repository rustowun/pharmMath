(() => {
  'use strict';
  const {bank,topics,formatNumber:fmt,parseNumber,isCorrect}=Pharmacy;
  const $=id=>document.getElementById(id);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  let session=[],index=0,records=[],answered=false,sessionFormat='mixed';
  const answerText=q=>q.type==='numeric'?`${fmt(q.answer)}${q.unit==='decimal'?'':` ${q.unit}`}`:q.answer;
  function options(q){
    if(q.type==='concept')return shuffle(q.choices);
    const wrong=[];
    for(const v of [q.answer*10,q.answer/10,q.answer*2,q.answer/2,q.answer+1,q.answer*1000]){
      const n=Number(v.toFixed(8));if(n>0&&n!==q.answer&&!wrong.includes(n))wrong.push(n);
    }
    return shuffle([q.answer,...shuffle(wrong).slice(0,3)]);
  }
  function eligible(){return bank.filter(q=>($('topic').value==='all'||q.topic===$('topic').value)&&($('format').value!=='input'||q.type==='numeric'));}
  function settingsChanged(){
    const conceptOnly=$('topic').value==='reasoning';
    $('format').querySelector('[value="input"]').disabled=conceptOnly;
    if(conceptOnly&&$('format').value==='input')$('format').value='choice';
    $('bank-count').textContent=`${eligible().length} questions available in this selection.`;
  }
  function makeSession(pool,count){
    // Round-robin randomized topic buckets gives mixed review real breadth.
    const buckets=shuffle(Object.keys(topics)).map(t=>shuffle(pool.filter(q=>q.topic===t))).filter(a=>a.length);
    const selected=[];
    while(selected.length<Math.min(count,pool.length))for(const a of buckets){if(a.length&&selected.length<count)selected.push(a.pop());}
    return shuffle(selected);
  }
  function start(pool=null,focus=true){
    const candidates=pool||eligible();
    const count=pool?pool.length:$('length').value==='all'?candidates.length:Number($('length').value);
    sessionFormat=$('format').value;
    session=makeSession(candidates,count).map((q,i)=>({...q,mode:q.type==='concept'||sessionFormat==='choice'?'choice':sessionFormat==='input'?'input':i%2===0?'input':'choice'}));
    index=0;records=[];if(window.matchMedia('(max-width:680px)').matches)$('session-settings').open=false;showView('practice');$('results-panel').hidden=true;$('quiz-panel').hidden=false;renderQuestion(focus);
  }
  function renderQuestion(focus=true){
    const q=session[index];answered=false;
    const choices=q.mode==='choice'?options(q):[];
    $('quiz-panel').innerHTML=`
      <div class="quiz-topline"><span>Question <b>${index+1}</b> of ${session.length}</span><span class="session-score">${records.filter(r=>r.correct).length} correct / ${records.length} checked</span></div>
      <div class="progress" role="progressbar" aria-label="Questions completed" aria-valuenow="${index}" aria-valuemin="0" aria-valuemax="${session.length}"><div class="progress-fill" style="width:${100*index/session.length}%"></div></div>
      <div class="question-label"><span class="tag">${topics[q.topic]}</span><span class="tag outline">${q.mode==='input'?'TYPE YOUR ANSWER':'MULTIPLE CHOICE'}</span></div>
      <h2 class="question" id="question-heading" tabindex="-1">${escape(q.prompt)}</h2>
      <p class="question-instruction">${q.topic==='household'?'Use 5 mL/tsp, 15 mL/tbsp, 30 mL/fl oz, and 240 mL/cup.':q.topic==='weight'?'Use 1 kg = 2.2 lb for this exercise.':q.type==='numeric'?'Keep full precision. No rounding is needed for this question.':'Choose the best answer.'}</p>
      <form id="answer-form" novalidate>${q.mode==='input'?`<label for="answer" class="answer-label">Your answer</label><div class="input-wrap"><input id="answer" type="text" inputmode="decimal" autocomplete="off" aria-describedby="input-help validation" placeholder="Enter a number"><span>${escape(q.unit)}</span></div><p class="field-note" id="input-help">Enter a number only. Decimals, fractions, and grouped commas are accepted.</p>`:`<fieldset class="choices"><legend class="sr-only">Choose your answer</legend>${choices.map((v,i)=>`<label class="choice"><input type="radio" name="answer" value="${i}"><span>${escape(q.type==='numeric'?`${fmt(v)}${q.unit==='decimal'?'':` ${q.unit}`}`:v)}</span><span class="choice-result"></span></label>`).join('')}</fieldset>`}
      <p id="validation" class="validation" role="alert" hidden></p><div class="actions"><button class="primary" id="check" type="submit">Check answer</button><button class="secondary" id="reveal" type="button">I’m not sure · show answer</button></div></form>
      <div id="feedback" aria-live="polite" aria-atomic="true"></div><div class="actions" id="next-action" hidden><button id="next" class="primary">${index+1===session.length?'See my results':'Next question →'}</button></div>`;
    $('answer-form').addEventListener('submit',e=>{
      e.preventDefault();if(answered)return;
      let value;
      if(q.mode==='input')value=parseNumber($('answer').value);
      else{const checked=$('answer-form').querySelector('input:checked');value=checked?choices[Number(checked.value)]:null;}
      if(value===null){$('validation').textContent=q.mode==='input'?'Enter a valid number, such as 0.5, 1/2, or 1,000. Do not include a unit.':'Choose an answer before checking.';$('validation').hidden=false;if(q.mode==='input')$('answer').focus();return;}
      grade(value,false,choices);
    });
    $('reveal').addEventListener('click',()=>grade(null,true,choices));
    $('next').addEventListener('click',()=>{index++;index===session.length?showResults():renderQuestion();});
    if(focus){$('question-heading').focus({preventScroll:true});$('quiz-panel').scrollIntoView({behavior:'smooth',block:'start'});}
  }
  function grade(value,skipped,choices){
    if(answered)return;answered=true;
    const q=session[index],correct=!skipped&&isCorrect(q,value);
    records.push({q,value,correct,skipped});$('validation').hidden=true;
    for(const el of $('answer-form').querySelectorAll('input,button'))el.disabled=true;
    if(q.mode==='choice'){
      for(const input of $('answer-form').querySelectorAll('input')){
        const v=choices[Number(input.value)],label=input.closest('label');
        if(isCorrect(q,v)){label.classList.add('correct');label.querySelector('.choice-result').textContent='Correct';}
        else if(input.checked){label.classList.add('wrong');label.querySelector('.choice-result').textContent='Your answer';}
      }
    }
    $('feedback').innerHTML=`<div class="feedback ${correct?'':'wrong'}"><h3>${correct?'Correct. Nicely done.':skipped?'Let’s work through it.':'Not quite. Here’s the answer.'}</h3>${!correct&&!skipped?`<p>Your answer: <b>${escape(q.type==='numeric'?`${fmt(value)}${q.unit==='decimal'?'':` ${q.unit}`}`:value)}</b></p>`:''}<p>${correct?'Answer':'Correct answer'}: <b>${escape(answerText(q))}</b></p><p class="solution">${escape(q.explanation)}</p><p class="memory">Memory cue: ${escape(q.memory)}</p>${skipped?'<p class="memory">Counted as missed so you can practice it again.</p>':''}</div>`;
    $('next-action').hidden=false;
    $('quiz-panel').querySelector('.session-score').textContent=`${records.filter(r=>r.correct).length} correct / ${records.length} checked`;
    $('quiz-panel').querySelector('.progress-fill').style.width=`${100*(index+1)/session.length}%`;
    $('quiz-panel').querySelector('[role="progressbar"]').setAttribute('aria-valuenow',index+1);
    $('next').focus({preventScroll:true});$('feedback').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function showResults(){
    $('quiz-panel').hidden=true;$('results-panel').hidden=false;
    const correct=records.filter(r=>r.correct).length,missed=records.filter(r=>!r.correct);
    $('results-panel').innerHTML=`<p class="eyebrow">SESSION COMPLETE</p><h2 id="results-heading" tabindex="-1">${missed.length?'Good practice. Keep building.':'Every question correct.'}</h2><div class="result-number">${Math.round(correct/records.length*100)}% <small>${correct} / ${records.length} correct</small></div><p>${missed.length?`${missed.length} question${missed.length===1?' needs':'s need'} another look. Review the explanations below or retry just those questions.`:'You checked every answer. Try a fresh session or a different topic.'}</p><div class="actions">${missed.length?'<button id="retry-missed" class="primary">Retry missed questions</button>':''}<button id="new-session" class="secondary">New session</button></div><h3 class="review-title">Your answer review</h3>${records.map(r=>`<details><summary><span class="result-status ${r.correct?'good':''}">${r.correct?'CORRECT':r.skipped?'REVEALED':'MISSED'}</span>${escape(r.q.prompt)}</summary><p>Your answer: ${r.skipped?'Answer revealed':escape(r.q.type==='numeric'?`${fmt(r.value)}${r.q.unit==='decimal'?'':` ${r.q.unit}`}`:r.value)}</p><p><b>Correct answer: ${escape(answerText(r.q))}</b></p><p>${escape(r.q.explanation)}</p></details>`).join('')}`;
    if(missed.length)$('retry-missed').addEventListener('click',()=>start(missed.map(r=>r.q)));
    $('new-session').addEventListener('click',()=>start());
    $('results-heading').focus({preventScroll:true});$('results-panel').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function showView(view){
    const practice=view==='practice';$('practice-view').hidden=!practice;$('reference-view').hidden=practice;
    for(const name of ['practice','reference']){const active=name===view;$(name+'-tab').classList.toggle('active',active);if(active)$(name+'-tab').setAttribute('aria-current','page');else $(name+'-tab').removeAttribute('aria-current');}
  }
  $('practice-tab').addEventListener('click',()=>showView('practice'));
  $('reference-tab').addEventListener('click',()=>showView('reference'));
  $('settings-form').addEventListener('submit',e=>{e.preventDefault();start();});
  $('topic').addEventListener('change',settingsChanged);$('format').addEventListener('change',settingsChanged);
  $('reference-view').innerHTML=`<div class="ref-grid">
    <article class="ref-card panel"><p class="eyebrow">01 / CONVERSION LADDER</p><h2>Small units, big count.</h2><div class="formula">kg → g → mg → mcg</div><p>Each step right: <b>multiply by 1,000.</b><br>Each step left: <b>divide by 1,000.</b></p><p><b>Kind Giants Make Muffins</b><br>Kilo · Gram · Milli · Micro</p><table><caption class="sr-only">Exact metric conversions</caption><tbody><tr><td>1 kg</td><td>1,000 g</td></tr><tr><td>1 g</td><td>1,000 mg</td></tr><tr><td>1 mg</td><td>1,000 mcg</td></tr><tr><td>1 L</td><td>1,000 mL</td></tr></tbody></table><h3>Two steps? Use both factors.</h3><p>0.004 g × 1,000 = 4 mg.<br>4 mg × 1,000 = 4,000 mcg.</p><p>The combined factor is 1,000,000, not 2,000.</p></article>
    <article class="ref-card panel"><p class="eyebrow">02 / HOUSEHOLD & WEIGHT</p><h2>Tea is 5; table is triple.</h2><table><caption class="sr-only">Study conversion factors</caption><tbody><tr><td>1 tsp</td><td>5 mL</td></tr><tr><td>1 tbsp = 3 tsp</td><td>15 mL</td></tr><tr><td>1 fl oz</td><td>about 30 mL</td></tr><tr><td>1 cup</td><td>about 240 mL</td></tr><tr><td>1 kg</td><td>about 2.2 lb</td></tr></tbody></table><p class="small">These are the source PDF’s study conventions. Rounded household and weight factors are not exact physical equivalents.</p><h3>Pounds are plentiful.</h3><p>lb to kg: divide by 2.2.<br>kg to lb: multiply by 2.2.<br>154 lb ÷ 2.2 = 70 kg.<br>70 kg × 2.2 = 154 lb.</p><p>For the same weight, the pounds number is larger.</p></article>
    <article class="ref-card panel"><p class="eyebrow">03 / DOSE CALCULATIONS</p><h2>Want over got, times quantity.</h2><div class="formula">Desired / Have × Quantity</div><p><b>D:</b> ordered dose.<br><b>H:</b> available dose.<br><b>Q:</b> tablets or volume containing H.</p><p>Make the units of D and H match before calculating.</p><h3>Tablets</h3><p>500 mg ordered; 250 mg per tablet.<br>(500 / 250) × 1 = <b>2 tablets.</b></p><h3>Liquid</h3><p>250 mg ordered; 125 mg per 5 mL.<br>(250 / 125) × 5 = <b>10 mL.</b></p><h3>Convert first</h3><p>0.5 g ordered; 250 mg per tablet.<br>0.5 g = 500 mg.<br>(500 / 250) × 1 = <b>2 tablets.</b></p><h3>Smaller than the label amount</h3><p>75 mg ordered; 150 mg per 5 mL.<br>(75 / 150) × 5 = <b>2.5 mL.</b></p></article>
    <article class="ref-card panel"><p class="eyebrow">04 / WORKED CONVERSIONS</p><h2>Let the units guide you.</h2><ul><li>2 g × 1,000 = <b>2,000 mg</b></li><li>500 mg ÷ 1,000 = <b>0.5 g</b></li><li>250 mcg ÷ 1,000 = <b>0.25 mg</b></li><li>1.5 L × 1,000 = <b>1,500 mL</b></li><li>750 mL ÷ 1,000 = <b>0.75 L</b></li><li>2 tsp × 5 mL/tsp = <b>10 mL</b></li><li>2 tbsp × 15 mL/tbsp = <b>30 mL</b></li><li>2 fl oz × 30 mL/fl oz = <b>about 60 mL</b></li></ul><h3>Cancel the starting unit</h3><p>2 g × (1,000 mg / 1 g) = <b>2,000 mg.</b> Put the starting unit on the bottom so it cancels.</p><h3>Fractions to remember</h3><p>1/2 = 0.5 · 1/4 = 0.25 · 3/4 = 0.75</p><p>3/4 g = 0.75 g = <b>750 mg.</b> Multiply by 1,000: move the decimal three places right. Divide: three places left.</p></article>
    <article class="ref-card panel"><p class="eyebrow">05 / MASS VS. VOLUME</p><h2>mg and mL are different.</h2><p><b>Mass:</b> kg, g, mg, mcg.<br><b>Volume:</b> L, mL, tsp, tbsp, fl oz.</p><p>A fluid ounce is a volume, not an ounce of weight. You need a concentration to convert between mg and mL.</p><h3>Find the concentration</h3><p>125 mg / 5 mL = <b>25 mg/mL.</b><br>For 250 mg: 250 / 25 = <b>10 mL.</b></p><h3>Find how much medicine is in a volume</h3><p>100 mg / 5 mL = 20 mg/mL.<br>20 mg/mL × 10 mL = <b>200 mg.</b></p><p>Do not set Q to 1 automatically. If the label gives 125 mg per 5 mL, Q is 5 mL.</p></article>
    <article class="ref-card panel"><p class="eyebrow">06 / CATCH THE ERRORS</p><h2>Use the SAME checklist.</h2><p><b>S</b> — State the starting and wanted units.<br><b>A</b> — Align units before dose math.<br><b>M</b> — Multiply or divide with units.<br><b>E</b> — Evaluate the size; check in reverse.</p><h3>Write clear numbers</h3><p>Write <b>0.5</b>, not .5. Write <b>5</b>, not 5.0. Keep full precision; round only at the end as instructed.</p><h3>Check your answer backward</h3><p>2 tablets × 250 mg/tablet = 500 mg. The answer should recover the ordered dose.</p><h3>Measure with the right device</h3><p>Use an appropriate calibrated dosing device, not a household spoon.</p></article>
    <article class="ref-card panel wide"><p class="eyebrow">07 / BUILD THE HABIT</p><h2>Your ten-minute routine</h2><ol><li><b>2 minutes:</b> write the ladder and core conversions from memory.</li><li><b>3 minutes:</b> explain two worked examples aloud.</li><li><b>4 minutes:</b> solve six questions, including one D / H × Q problem.</li><li><b>1 minute:</b> correct mistakes and name the rule you missed.</li></ol><p class="small">Content: the supplied four-page PDF and expanded seven-page study guide. Measurement and decimal notation references: <a href="https://www.fda.gov/media/78087/download" target="_blank" rel="noopener">FDA dosing-device guidance</a> and <a href="https://www.fda.gov/media/88498/download" target="_blank" rel="noopener">NCPDP metric dosing resource</a>. These exercises are for exam practice, not patient-specific dosing decisions.</p></article>
  </div>`;
  const mobile=window.matchMedia('(max-width:680px)');
  mobile.addEventListener('change',e=>{$('session-settings').open=!e.matches;});
  $('session-settings').open=!mobile.matches;
  settingsChanged();start(null,false);
})();
