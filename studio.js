const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Redirect root safely
app.get('/', (req, res) => res.redirect('/machines.html'));

const LABS_FILE = path.join(__dirname, 'js', 'labs.js');

app.post('/api/publish', (req, res) => {
    try {
        const newLab = req.body;
        if (!newLab.slug || !newLab.title) {
            return res.status(400).json({ error: 'Missing required fields: slug and title' });
        }

        let content = fs.readFileSync(LABS_FILE, 'utf8');

        const slugRegex = new RegExp(`slug:\\s*'${newLab.slug}'`);
        if (slugRegex.test(content)) {
            return res.status(400).json({ error: `A machine with the slug '${newLab.slug}' already exists!` });
        }

        if (newLab.base64Image) {
            try {
                const base64Data = newLab.base64Image.replace(/^data:image\/\w+;base64,/, "");
                const extMatch = newLab.base64Image.match(/^data:image\/(\w+);base64,/);
                const ext = extMatch ? (extMatch[1] === 'jpeg' ? 'jpg' : extMatch[1]) : 'png';
                const imgFileName = `avatar-${newLab.slug}.${ext}`;
                const imgPath = path.join(__dirname, 'img', imgFileName);
                fs.writeFileSync(imgPath, base64Data, 'base64');
                newLab.avatar = `img/${imgFileName}`;
            } catch (err) {
                console.error('Image processing failed', err);
            }
        }

        const idMatch = content.match(/id:\s*(\d+)/g);
        let nextId = 1;
        if (idMatch) {
            const ids = idMatch.map(s => parseInt(s.replace(/\D/g, '')));
            nextId = Math.max(...ids) + 1;
        }

        newLab.id = nextId;

        const formatArray = (arr) => arr && arr.length > 0 ? `[\n      ${arr.map(a => `'${a.replace(/'/g, "\\'")}'`).join(',\n      ')}\n    ]` : '[]';

        const dockerCommandsStr = newLab.dockerCommands && newLab.dockerCommands.length > 0
            ? `[\n      ${newLab.dockerCommands.map(c => `'${c.replace(/'/g, "\\'")}'`).join(',\n      ')}\n    ]`
            : '[]';

        const labString = `  {
    id: ${newLab.id},
    slug: '${newLab.slug}',
    title: '${newLab.title}',
    icon: '${newLab.icon || '📦'}',
    avatar: '${newLab.avatar || 'img/placeholder.png'}',
    difficulty: '${newLab.difficulty || 'Easy'}',
    category: '${newLab.category || 'Web'}',
    description: '${(newLab.description || '').replace(/'/g, "\\'").replace(/\n/g, " ")}',
    longDescription: \`${(newLab.longDescription || '').replace(/`/g, "\\`")}\`,
    creator: '${(newLab.creator || 'Dock & Root').replace(/'/g, "\\'")}',
    releaseDate: '${newLab.releaseDate || new Date().toISOString().split('T')[0]}',
    estimatedTime: '${newLab.estimatedTime || '30 min'}',
    points: ${newLab.points || 100},
    skills: ${formatArray(newLab.skills)},
    prerequisites: ${formatArray(newLab.prerequisites)},
    objectives: ${formatArray(newLab.objectives)},
    githubUrl: '${newLab.githubUrl || ''}',
    dockerCommands: ${dockerCommandsStr},
    flagHash: '${newLab.flagHash || ''}'
  },`;

        const injectionTarget = 'const LABS = [';
        if (!content.includes(injectionTarget)) {
            return res.status(500).json({ error: 'Could not find "const LABS = [" in labs.js' });
        }

        content = content.replace(
            injectionTarget,
            `${injectionTarget}\n${labString}`
        );

        fs.writeFileSync(LABS_FILE, content, 'utf8');
        res.json({ success: true, message: 'Lab published successfully! Hit refresh on the main site.', id: nextId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\x1b[32m[Dock & Root Creator Studio]\x1b[0m API Service running on http://localhost:${PORT}`);
    console.log(`\x1b[36m[Action Required]\x1b[0m Open \`creator.html\` in your browser to begin drafting machines.`);
});
