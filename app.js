document.addEventListener('DOMContentLoaded', () => {
    let data = {};
    const allElements = {
        protagonistSelect: document.getElementById('protagonist'),
        antagonistSelect: document.getElementById('antagonist'),
        settingSelect: document.getElementById('setting'),
        motiveSelect: document.getElementById('motive'),
        twistSelect: document.getElementById('twist'),
        ceoSelect: document.getElementById('ceo'),
        leaderSelect: document.getElementById('leader'),
        generateBtn: document.getElementById('generateBtn'),
        resultP: document.getElementById('result'),
        generationControls: document.getElementById('generation-controls'),
        saveBtn: document.getElementById('saveBtn'),
        exportBtn: document.getElementById('exportBtn'),
        promptOutputTextarea: document.getElementById('promptOutput'),
        copyPromptBtn: document.getElementById('copyPromptBtn'),
        artStyleSelect: document.getElementById('artStyle'),
        moodSelect: document.getElementById('mood'),
        storyTemplateDisplay: document.getElementById('story-template-display'),
        act1Textarea: document.getElementById('act1'),
        act2Textarea: document.getElementById('act2'),
        act3Textarea: document.getElementById('act3'),
        elaborateBtn: document.getElementById('elaborateBtn'),
        thumbnailIdeasContainer: document.getElementById('thumbnailIdeasContainer'),
        pollQuestionContainer: document.getElementById('pollQuestionContainer'),
        titleListTextarea: document.getElementById('titleList'),
        youtubeDescTextarea: document.getElementById('youtubeDesc'),
        hashtagsTextarea: document.getElementById('hashtags'),
        copySocialsBtn: document.getElementById('copySocialsBtn'),
        hallOfLegendsContainer: document.getElementById('savedLegendsContainer'),
        rerollProtagonist: document.getElementById('rerollProtagonist'),
        rerollAntagonist: document.getElementById('rerollAntagonist'),
        rerollSetting: document.getElementById('rerollSetting'),
        rerollMotive: document.getElementById('rerollMotive'),
        rerollTwist: document.getElementById('rerollTwist'),
        manageRosterBtn: document.getElementById('manageRosterBtn'),
        rosterModal: document.getElementById('roster-manager-modal'),
        closeModalBtn: document.querySelector('.close-btn'),
        addCharForm: document.getElementById('add-character-form'),
        addItemForm: document.getElementById('add-item-form'),
        customRosterDisplay: document.getElementById('custom-roster-display')
    };
    
    let currentSelection = {};
    let flatProtagonists = [], flatAntagonists = [], legends = [];
    let customData = { protagonists: [], antagonists: [], settings: [], motives: [], twists: [] };

    // --- DATA LOADING & INITIALIZATION ---
    function initializeApp() {
        loadCustomData();
        mergeData();
        populateAllSelects();
        setupEventListeners();
        loadSavedLegends();
    }

    fetch('database.json')
        .then(response => response.json())
        .then(jsonData => {
            data.base = jsonData;
            initializeApp();
        })
        .catch(error => console.error('Error loading database:', error));

    function loadCustomData() {
        const savedCustomData = localStorage.getItem('mythosCustomData');
        if (savedCustomData) {
            customData = JSON.parse(savedCustomData);
        }
    }

    function mergeData() {
        data.merged = JSON.parse(JSON.stringify(data.base));

        if (customData.protagonists.length > 0) {
            const customGroup = { groupName: "Your Custom Characters", characters: customData.protagonists };
            data.merged.protagonists.push(customGroup);
        }
        if (customData.antagonists.length > 0) {
            const customGroup = { groupName: "Your Custom Characters", characters: customData.antagonists };
            data.merged.antagonists.push(customGroup);
        }

        data.merged.settings = [...new Set([...data.base.settings, ...customData.settings])];
        data.merged.motives = [...new Set([...data.base.motives, ...customData.motives])];
        data.merged.twists = [...new Set([...data.base.twists, ...customData.twists])];
    }

    function populateAllSelects() {
        flatProtagonists = flattenCharacterList(data.merged.protagonists);
        flatAntagonists = flattenCharacterList(data.merged.antagonists);
        populateGroupedSelect(allElements.protagonistSelect, data.merged.protagonists);
        populateGroupedSelect(allElements.antagonistSelect, data.merged.antagonists);
        populateSelect(allElements.settingSelect, data.merged.settings);
        populateSelect(allElements.motiveSelect, data.merged.motives);
        populateSelect(allElements.twistSelect, data.merged.twists);
        populateSelect(allElements.ceoSelect, data.base.ceos, true);
        populateSelect(allElements.leaderSelect, data.base.leaders, true);
        populateSelect(allElements.artStyleSelect, data.base.artStyles, false, true);
        populateSelect(allElements.moodSelect, data.base.moods, false, true);
    }

    // --- HELPER FUNCTIONS ---
    function populateGroupedSelect(selectElement, groupedItems) {
        selectElement.innerHTML = '<option value="random">-- Random --</option>';
        groupedItems.forEach(group => {
            if (group.characters.length === 0) return;
            const optgroup = document.createElement('optgroup');
            optgroup.label = group.groupName;
            group.characters.sort((a, b) => a.name.localeCompare(b.name)).forEach(character => {
                const option = document.createElement('option');
                option.value = character.name;
                option.textContent = character.name;
                optgroup.appendChild(option);
            });
            selectElement.appendChild(optgroup);
        });
    }

    function populateSelect(selectElement, items, optional = false) {
        let defaultOption = optional ? '<option value="none">-- None --</option>' : '<option value="random">-- Random --</option>';
        selectElement.innerHTML = defaultOption;
        items.sort().forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
    }

    function flattenCharacterList(groupedList) {
        return groupedList.reduce((acc, group) => acc.concat(group.characters), []);
    }

    function getCharacterObject(name, list) {
        for (const group of list) {
            const found = group.characters.find(char => char.name === name);
            if (found) return found;
        }
        return { name: name, tags: ["custom"] };
    }

    function getRandomItem(array) { return array[Math.floor(Math.random() * array.length)]; }

    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => { button.textContent = originalText; }, 2000);
        });
    }

    // --- GENERATOR FUNCTIONS ---
    function generateArtPrompt() {
        const { protagonist, antagonist, setting, motive } = currentSelection;
        const style = allElements.artStyleSelect.value;
        const mood = allElements.moodSelect.value;
        const camera = ["dynamic wide shot", "dramatic low-angle shot", "intense close-up", "action-packed medium shot"];

        let prompt = `A ${getRandomItem(camera)} of ${protagonist.name} confronting ${antagonist.name} in ${setting}. Their conflict is fueled by ${motive}. Style: ${style}, ${mood}.`;

        const allTags = [...protagonist.tags, ...antagonist.tags];
        if (allTags.includes('magic')) prompt += ' glowing runes, arcane energy,';
        if (allTags.includes('tech')) prompt += ' gleaming metal, holographic displays, intricate circuitry,';
        if (allTags.includes('cosmic')) prompt += ' nebula background, swirling galaxies, cosmic power,';
        if (allTags.includes('rage')) prompt += ' dynamic motion blur, destructive environment,';
        if (allTags.includes('kaiju')) prompt += ' massive scale, city destruction, tiny helicopters for scale,';
        if (allTags.includes('stealth')) prompt += ' deep shadows, lurking presence,';

        prompt += ` cinematic, hyperrealistic, epic composition, unreal engine 5, 8k, detailed, atmospheric lighting. #EternalMythsAI --ar 16:9`;
        allElements.promptOutputTextarea.value = prompt;
    }

    function generateStoryOutline() {
        const p = currentSelection.protagonist;
        const a = currentSelection.antagonist;
        let templateName = "Classic Showdown";
        if (p.tags.includes('psychological') && a.tags.includes('psychological')) {
            templateName = "Mind Game";
        } else if (p.tags.includes('brute_force') && a.tags.includes('brute_force')) {
            templateName = "Clash of Titans";
        } else if ((p.tags.includes('magic') && a.tags.includes('tech')) || (p.tags.includes('tech') && a.tags.includes('magic'))) {
            templateName = "Arcane vs. Science";
        }

        allElements.storyTemplateDisplay.innerHTML = `<h3>~ ${templateName} Template Applied ~</h3>`;

        const template = data.base.scriptTemplates[templateName];
        allElements.act1Textarea.value = template.act1.replace('{protagonist}', p.name).replace('{antagonist}', a.name).replace('{setting}', currentSelection.setting).replace('{motive}', currentSelection.motive).replace('{twist}', currentSelection.twist);
        allElements.act2Textarea.value = template.act2.replace('{protagonist}', p.name).replace('{antagonist}', a.name).replace('{setting}', currentSelection.setting).replace('{motive}', currentSelection.motive).replace('{twist}', currentSelection.twist);
        allElements.act3Textarea.value = template.act3.replace('{protagonist}', p.name).replace('{antagonist}', a.name).replace('{setting}', currentSelection.setting).replace('{motive}', currentSelection.motive).replace('{twist}', currentSelection.twist);
    }

    function elaborateStory() {
        generateStoryOutline();
        allElements.act1Textarea.value += `\nThe air grows heavy, a palpable tension heralding the arrival of legends. The confrontation is not just a clash of power, but of will.`;
        allElements.act2Textarea.value += `\nThe fight is a hurricane of motion and energy, a saga told in blows and blasts. But the true battle is one of endurance and strategy, as each combatant adapts to the other's impossible capabilities.`;
        allElements.act3Textarea.value += `\nThe aftermath is silence. The victor stands not just over a fallen foe, but over a revealed truth that redefines their struggle, leaving a profound and startling question in its wake.`;
    }

    function generateThumbnailIdeas() {
        const { protagonist, antagonist } = currentSelection;
        const pName = protagonist.name.split(' (')[0];
        const aName = antagonist.name.split(' (')[0];
        let ideas = `
            <div class="thumbnail-idea"><b>Idea 1:</b> Extreme close-up on ${pName}'s face, with ${aName}'s silhouette reflected in their eyes.</div>
            <div class="thumbnail-idea"><b>Idea 2:</b> A split-screen shot, with each character's portrait on one half, separated by a crackle of energy.</div>
        `;
        if (protagonist.tags.includes('human') && (antagonist.tags.includes('kaiju') || antagonist.tags.includes('cosmic'))) {
            ideas += `<div class="thumbnail-idea"><b>Idea 3:</b> A tiny, determined figure of ${pName} looking up at the colossal, intimidating form of ${aName}.</div>`;
        } else {
            ideas += `<div class="thumbnail-idea"><b>Idea 3:</b> A shot from behind ${pName}, showing their battle-damaged back as they face the imposing figure of ${aName} in the distance.</div>`;
        }
        allElements.thumbnailIdeasContainer.innerHTML = ideas;
    }

    function generatePollQuestion() {
        const { protagonist, antagonist } = currentSelection;
        const pName = protagonist.name.split(' (')[0];
        const aName = antagonist.name.split(' (')[0];
        allElements.pollQuestionContainer.innerHTML = `<div class="poll-question"><b>YouTube Poll:</b> THE NEXT BATTLE IS SET: Who do you think would win this legendary fight: ${pName} or ${aName}? Vote and defend your choice in the comments! #EternalMythsAI</div>`;
    }

    function generateSocialMediaContent() {
        const { protagonist, antagonist } = currentSelection;
        const pName = protagonist.name.split(' (')[0];
        const aName = antagonist.name.split(' (')[0];

        allElements.titleListTextarea.value = `${pName} vs. ${aName}: The Ultimate Showdown\nWhat If ${pName} Fought ${aName}? (An Eternal Myths AI Simulation)\nThe EPIC Battle Between ${pName} and ${aName} Explained`;

        allElements.youtubeDescTextarea.value = `Eternal Myths AI — where legends never die. 🌌👁️\n\nIn this epic episode, we dive deep into the legendary theoretical battle between two titans: ${protagonist.name} and ${antagonist.name}.\n\nUsing AI to visualize this incredible encounter, we explore their powers, strategies, and the ultimate twist that decides the victor. Who do you think would win? Join the conversation in the comments below!\n\n#EternalMythsAI #AIStoryTelling #AICinema #AIArt #SuperheroMatchups #Mythology #Comics #${pName.replace(/\s+/g, '')} #${aName.replace(/\s+/g, '')}`;

        allElements.hashtagsTextarea.value = `#EternalMythsAI #AIStoryTelling #AICinema #AIArt #SuperheroMatchups #Mythology #Comics #UrbanLegends #${pName.replace(/\s+/g, '')} #${aName.replace(/\s+/g, '')} #WhatIf #EpicBattle`;
    }

    function updateAllOutputs() {
        if (!currentSelection.protagonist) return;
        generateArtPrompt();
        generateStoryOutline();
        generateSocialMediaContent();
        generateThumbnailIdeas();
        generatePollQuestion();

        document.getElementById('generation-controls').style.display = 'block';
        Array.from(document.querySelectorAll('#generated-content .module')).forEach(el => el.style.display = 'block');
        Array.from(document.getElementsByClassName('reroll-btn')).forEach(el => el.style.display = 'inline');
    }

    // --- MAIN LEGEND GENERATION & REROLL ---
    function generateLegend() {
        const pName = allElements.protagonistSelect.value === 'random' ? getRandomItem(flatProtagonists).name : allElements.protagonistSelect.value;
        const aName = allElements.antagonistSelect.value === 'random' ? getRandomItem(flatAntagonists).name : allElements.antagonistSelect.value;

        currentSelection.protagonist = getCharacterObject(pName, data.merged.protagonists);
        currentSelection.antagonist = getCharacterObject(aName, data.merged.antagonists);

        currentSelection.setting = allElements.settingSelect.value === 'random' ? getRandomItem(data.merged.settings) : allElements.settingSelect.value;
        currentSelection.motive = allElements.motiveSelect.value === 'random' ? getRandomItem(data.merged.motives) : allElements.motiveSelect.value;
        currentSelection.twist = allElements.twistSelect.value === 'random' ? getRandomItem(data.merged.twists) : allElements.twistSelect.value;
        currentSelection.ceo = allElements.ceoSelect.value;
        currentSelection.leader = allElements.leaderSelect.value;

        while (currentSelection.protagonist.name === currentSelection.antagonist.name) {
            currentSelection.antagonist = getRandomItem(flatAntagonists);
        }

        displayCurrentLegend();
        updateAllOutputs();
    }

    function displayCurrentLegend() {
        let story = `Driven by <strong>${currentSelection.motive}</strong>, <strong>${currentSelection.protagonist.name}</strong> battles <strong>${currentSelection.antagonist.name}</strong> in <strong>${currentSelection.setting}</strong>.`;
        if (currentSelection.ceo !== 'none') story += ` The conflict is secretly funded by <strong>${currentSelection.ceo}</strong>.`;
        if (currentSelection.leader !== 'none') story += ` The outcome is being judged by <strong>${currentSelection.leader}</strong>.`;
        story += ` But the ultimate twist is: <strong>${currentSelection.twist}</strong>.`;
        allElements.resultP.innerHTML = story;
    }

    function reroll(component) {
        switch (component) {
            case 'protagonist': currentSelection.protagonist = getRandomItem(flatProtagonists); break;
            case 'antagonist': currentSelection.antagonist = getRandomItem(flatAntagonists); break;
            case 'setting': currentSelection.setting = getRandomItem(data.merged.settings); break;
            case 'motive': currentSelection.motive = getRandomItem(data.merged.motives); break;
            case 'twist': currentSelection.twist = getRandomItem(data.merged.twists); break;
        }
        while (currentSelection.protagonist.name === currentSelection.antagonist.name) {
            currentSelection.antagonist = getRandomItem(flatAntagonists);
        }
        displayCurrentLegend();
        updateAllOutputs();
    }

    // --- LOCAL STORAGE & WORKSPACE ---
    function saveLegend() {
        if (!currentSelection.protagonist) return;
        const legendToSave = {
            protagonist: currentSelection.protagonist,
            antagonist: currentSelection.antagonist,
            setting: currentSelection.setting,
            motive: currentSelection.motive,
            twist: currentSelection.twist,
            ceo: allElements.ceoSelect.value,
            leader: allElements.leaderSelect.value,
            id: Date.now(),
            editedTitles: allElements.titleListTextarea.value,
            editedDesc: allElements.youtubeDescTextarea.value,
            editedHashtags: allElements.hashtagsTextarea.value,
            editedAct1: allElements.act1Textarea.value,
            editedAct2: allElements.act2Textarea.value,
            editedAct3: allElements.act3Textarea.value
        };
        legends.push(legendToSave);
        localStorage.setItem('mythosLegends', JSON.stringify(legends));
        renderLegends();
    }

    function renderLegends() {
        allElements.hallOfLegendsContainer.innerHTML = '';
        if (legends.length === 0) {
            allElements.hallOfLegendsContainer.innerHTML = '<p>Your saved projects will appear here.</p>';
            return;
        }
        legends.forEach(legend => {
            const legendDiv = document.createElement('div');
            legendDiv.className = 'saved-legend';
            legendDiv.innerHTML = `
                <button class="delete-legend-btn" data-id="${legend.id}">&times;</button>
                <p><strong>${legend.protagonist.name || legend.protagonist}</strong> vs <strong>${legend.antagonist.name || legend.antagonist}</strong></p>
                <p><em>Driven by ${legend.motive} in ${legend.setting}.</em></p>
                <div class="legend-actions">
                    <button class="action-btn load-btn" data-id="${legend.id}">Load Project</button>
                </div>
            `;
            allElements.hallOfLegendsContainer.appendChild(legendDiv);
        });
    }

    function loadLegend(id) {
        const legend = legends.find(l => l.id === id);
        if (!legend) return;

        currentSelection = {
            protagonist: getCharacterObject(legend.protagonist.name || legend.protagonist, data.merged.protagonists),
            antagonist: getCharacterObject(legend.antagonist.name || legend.antagonist, data.merged.antagonists),
            setting: legend.setting,
            motive: legend.motive,
            twist: legend.twist,
            ceo: legend.ceo || 'none',
            leader: legend.leader || 'none'
        };

        allElements.protagonistSelect.value = currentSelection.protagonist.name;
        allElements.antagonistSelect.value = currentSelection.antagonist.name;
        allElements.settingSelect.value = currentSelection.setting;
        allElements.motiveSelect.value = currentSelection.motive;
        allElements.twistSelect.value = currentSelection.twist;
        allElements.ceoSelect.value = currentSelection.ceo;
        allElements.leaderSelect.value = currentSelection.leader;

        displayCurrentLegend();
        updateAllOutputs();

        allElements.titleListTextarea.value = legend.editedTitles;
        allElements.youtubeDescTextarea.value = legend.editedDesc;
        allElements.hashtagsTextarea.value = legend.editedHashtags;
        allElements.act1Textarea.value = legend.editedAct1;
        allElements.act2Textarea.value = legend.editedAct2;
        allElements.act3Textarea.value = legend.editedAct3;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function deleteLegend(id) {
        legends = legends.filter(legend => legend.id !== id);
        localStorage.setItem('mythosLegends', JSON.stringify(legends));
        renderLegends();
    }

    function exportContent() {
        const pName = currentSelection.protagonist.name.split(' (')[0];
        const aName = currentSelection.antagonist.name.split(' (')[0];
        const content = `// CONTENT BRIEF //\n\nLEGEND: ${pName} vs. ${aName}\nMOTIVE: ${currentSelection.motive}\nTWIST: ${currentSelection.twist}\n\n// SCRIPT OUTLINE //\n\nACT I:\n${allElements.act1Textarea.value}\n\nACT II:\n${allElements.act2Textarea.value}\n\nACT III:\n${allElements.act3Textarea.value}\n\n// YOUTUBE CONTENT //\n\nTITLES:\n${allElements.titleListTextarea.value}\n\nDESCRIPTION:\n${allElements.youtubeDescTextarea.value}\n\nHASHTAGS:\n${allElements.hashtagsTextarea.value}\n\n// ASSETS //\n\nART PROMPT:\n${allElements.promptOutputTextarea.value}\n\nTHUMBNAIL IDEAS:\n${allElements.thumbnailIdeasContainer.innerText}`;
        const blob = new Blob([content.trim()], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `MythosEngine_${pName}_vs_${aName}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // --- ROSTER MANAGER ---
    function showRosterManager() {
        allElements.rosterModal.style.display = 'block';
        renderCustomRoster();
    }

    function closeRosterManager() { allElements.rosterModal.style.display = 'none'; }

    function addCharacter(e) {
        e.preventDefault();
        const name = document.getElementById('char-name').value;
        const source = document.getElementById('char-source').value;
        const type = document.getElementById('char-type').value;
        const tags = document.getElementById('char-tags').value.split(',').map(tag => tag.trim().toLowerCase());

        const newChar = { name: `${name} (${source})`, tags: tags };

        if (type === 'protagonist') {
            customData.protagonists.push(newChar);
        } else {
            customData.antagonists.push(newChar);
        }

        saveCustomDataAndReload();
        e.target.reset();
    }

    function addItem(e) {
        e.preventDefault();
        const text = document.getElementById('item-text').value;
        const type = document.getElementById('item-type').value;
        if (!customData[type].includes(text)) {
            customData[type].push(text);
        }
        saveCustomDataAndReload();
        e.target.reset();
    }

    function saveCustomDataAndReload() {
        localStorage.setItem('mythosCustomData', JSON.stringify(customData));
        mergeData();
        populateAllSelects();
        renderCustomRoster();
    }

    function renderCustomRoster() {
        allElements.customRosterDisplay.innerHTML = '';
        const allCustomItems = [
            ...customData.protagonists.map(item => ({ name: item.name, type: 'protagonists' })),
            ...customData.antagonists.map(item => ({ name: item.name, type: 'antagonists' })),
            ...customData.settings.map(item => ({ name: item, type: 'settings' })),
            ...customData.motives.map(item => ({ name: item, type: 'motives' })),
            ...customData.twists.map(item => ({ name: item, type: 'twists' }))
        ];

        if (allCustomItems.length === 0) {
            allElements.customRosterDisplay.innerHTML = '<span>No custom entries yet.</span>';
            return;
        }

        allCustomItems.forEach((item) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'custom-item';
            itemDiv.innerHTML = `<span>${item.name} <i>(${item.type})</i></span><button data-name="${item.name}" data-type="${item.type}">Delete</button>`;
            allElements.customRosterDisplay.appendChild(itemDiv);
        });
    }

    function deleteCustomItem(e) {
        if (e.target.tagName !== 'BUTTON') return;
        const type = e.target.dataset.type;
        const name = e.target.dataset.name;

        if (type === 'protagonists' || type === 'antagonists') {
            customData[type] = customData[type].filter(char => char.name !== name);
        } else {
            customData[type] = customData[type].filter(item => item !== name);
        }
        saveCustomDataAndReload();
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        allElements.generateBtn.addEventListener('click', generateLegend);
        allElements.elaborateBtn.addEventListener('click', elaborateStory);
        allElements.rerollProtagonist.addEventListener('click', () => reroll('protagonist'));
        allElements.rerollAntagonist.addEventListener('click', () => reroll('antagonist'));
        allElements.rerollSetting.addEventListener('click', () => reroll('setting'));
        allElements.rerollMotive.addEventListener('click', () => reroll('motive'));
        allElements.rerollTwist.addEventListener('click', () => reroll('twist'));
        allElements.saveBtn.addEventListener('click', saveLegend);
        allElements.exportBtn.addEventListener('click', exportContent);
        allElements.manageRosterBtn.addEventListener('click', showRosterManager);
        allElements.closeModalBtn.addEventListener('click', closeRosterManager);
        window.addEventListener('click', (e) => { if (e.target == allElements.rosterModal) closeRosterManager(); });
        allElements.addCharForm.addEventListener('submit', addCharacter);
        allElements.addItemForm.addEventListener('submit', addItem);
        allElements.customRosterDisplay.addEventListener('click', deleteCustomItem);

        allElements.copyPromptBtn.addEventListener('click', () => copyToClipboard(allElements.promptOutputTextarea.value, allElements.copyPromptBtn));
        allElements.copySocialsBtn.addEventListener('click', () => {
            const text = `TITLES:\n${allElements.titleListTextarea.value}\n\nDESCRIPTION:\n${allElements.youtubeDescTextarea.value}\n\nHASHTAGS:\n${allElements.hashtagsTextarea.value}`;
            copyToClipboard(text, allElements.copySocialsBtn);
        });
        allElements.hallOfLegendsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-legend-btn')) {
                deleteLegend(parseInt(e.target.dataset.id, 10));
            }
            if (e.target.classList.contains('load-btn')) {
                loadLegend(parseInt(e.target.dataset.id, 10));
            }
        });
    }

    function loadSavedLegends() {
        const saved = localStorage.getItem('mythosLegends');
        if (saved) {
            legends = JSON.parse(saved);
            renderLegends();
        }
    }

});