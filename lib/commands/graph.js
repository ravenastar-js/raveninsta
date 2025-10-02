const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 🗺️ Comando Graph - Gera Mapa interativo usando Markmap
 * @module commands/graph
 * @async
 * @param {string} identifier - ID ou username do perfil
 * @param {Object} options - Opções de configuração
 */
async function execute(identifier, options) {
    try {
        const profilesDir = options.pasta || './perfis';

        if (!await fs.pathExists(profilesDir)) {
            console.log('❌ Pasta de perfis não encontrada');
            console.log('💡 Execute primeiro: raveninsta buscar <usuario>');
            return;
        }

        const profiles = await findProfiles(profilesDir);

        if (profiles.length === 0) {
            console.log('❌ Nenhum perfil encontrado para análise');
            console.log('💡 Execute primeiro: raveninsta buscar <usuario>');
            return;
        }

        let selectedProfile;

        if (identifier) {
            selectedProfile = await findProfileByIdentifier(profiles, identifier);
            if (!selectedProfile) {
                console.log(`❌ Perfil "${identifier}" não encontrado`);
                return;
            }
        } else {
            selectedProfile = await selectProfileInteractive(profiles);
            if (!selectedProfile) return;
        }

        await generateMarkmap(selectedProfile);

    } catch (error) {
        console.log('❌ Erro ao gerar gráfico:', error.message);
    }
}

/**
 * 🔍 Encontrar todos os perfis disponíveis
 */
async function findProfiles(profilesDir) {
    const profiles = [];

    try {
        const items = await fs.readdir(profilesDir);

        for (const item of items) {
            const profilePath = path.join(profilesDir, item);
            const stats = await fs.stat(profilePath);

            if (stats.isDirectory()) {
                const dataFile = path.join(profilePath, 'dados.json');

                if (await fs.pathExists(dataFile)) {
                    const profileData = await fs.readJson(dataFile);
                    profiles.push({
                        id: item,
                        path: profilePath,
                        data: profileData
                    });
                }
            }
        }
    } catch (error) {
        console.log('❌ Erro ao ler perfis:', error.message);
    }

    return profiles;
}

/**
 * 🎯 Encontrar perfil por identificador
 */
async function findProfileByIdentifier(profiles, identifier) {
    const cleanIdentifier = identifier.replace('@', '');
    return profiles.find(profile =>
        profile.id === cleanIdentifier ||
        profile.data.username === cleanIdentifier
    );
}

/**
 * 🖱️ Seleção interativa de perfil
 */
async function selectProfileInteractive(profiles) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('\n📊 PERFIS DISPONÍVEIS:');
    console.log('='.repeat(50));

    profiles.forEach((profile, index) => {
        const user = profile.data;
        console.log(`${index + 1}. @${user.username} (ID: ${profile.id})`);
        console.log(`   👤 ${user.full_name || 'Sem nome'}`);
        console.log(`   👥 ${user.followers?.toLocaleString() || 0} seguidores`);
        console.log(`   📝 ${user.posts_count?.toLocaleString() || 0} posts`);
        console.log('');
    });

    return new Promise((resolve) => {
        readline.question('🎯 Selecione o número do perfil (ou 0 para cancelar): ', async (answer) => {
            readline.close();

            const choice = parseInt(answer);
            if (choice === 0 || isNaN(choice) || choice < 1 || choice > profiles.length) {
                console.log('❌ Seleção cancelada ou inválida');
                resolve(null);
                return;
            }

            resolve(profiles[choice - 1]);
        });
    });
}

/**
 * 📊 Gerar Mapa interativo com Markmap CLI
 */
async function generateMarkmap(profile) {
    try {
        const user = profile.data;

        const markdownContent = generateMarkdownContent(user);
        const markdownFile = path.join(profile.path, `${user.id}.md`);
        const outputFile = path.join(profile.path, `${user.id}.html`);

        await fs.writeFile(markdownFile, markdownContent);

        console.log('📝 Gerando Mapa interativo com Markmap CLI...');

        try {
            execSync(`npx markmap "${markdownFile}" --output "${outputFile}" --no-open`, {
                stdio: 'inherit',
                cwd: process.cwd()
            });

            await fs.remove(markdownFile);

            console.log(`\n🗺️  Mapa interativo gerado com sucesso!`);
            console.log(`📁 Arquivo: ${outputFile}`);
            console.log(`🔗 Abra no navegador para visualizar`);
            console.log(`💡 Use: file:///${path.resolve(outputFile)}`);

        } catch (execError) {
            console.log('❌ Erro ao executar Markmap CLI:', execError.message);
            console.log('💡 Tentando método alternativo...');

            try {
                execSync(`npx markmap "${markdownFile}" -o "${outputFile}"`, {
                    stdio: 'inherit',
                    cwd: process.cwd()
                });

                await fs.remove(markdownFile);
                console.log(`\n🗺️  Mapa interativo gerado com sucesso (método alternativo)!`);
                console.log(`📁 Arquivo: ${outputFile}`);

            } catch (altError) {
                console.log('❌ Erro também no método alternativo:', altError.message);
                console.log('💡 Instale o Markmap globalmente: npm install -g markmap-cli');
            }
        }

    } catch (error) {
        console.log('❌ Erro ao gerar Mapa interativo:', error.message);
    }
}

/**
 * 📝 Gerar conteúdo Markdown para o Markmap
 */
function generateMarkdownContent(user) {
    const followers = user.followers?.toLocaleString() || '0';
    const following = user.following?.toLocaleString() || '0';
    const posts = user.posts_count?.toLocaleString() || '0';
    const lastUpdated = user.last_updated ? new Date(user.last_updated).toLocaleString('pt-BR') : 'N/A';
    const firstAnalysis = user.first_analysis ? new Date(user.first_analysis).toLocaleString('pt-BR') : 'N/A';
    const analysisCount = user.analysis_count || 1;

    return `# @${user.username} (${user.id})
[🔗 Abrir no Instagram](https://instagram.com/${user.username})

## 📊 Estatísticas Básicas

- **👥 Seguidores:** ${followers}
- **➡️ Seguindo:** ${following}
- **📝 Posts:** ${posts}

## 👤 Informações do Perfil

- **📌 Biografia:** ${user.biography || 'Sem biografia'}
- **🔐 Conta:** ${user.is_private ? '🔒 Privada' : '🌐 Pública'}
- **✅ Verificação:** ${user.is_verified ? '✔️ Verificado' : '❌ Não verificado'}

## 🆔 Identificação

- **ID Numérico:** \`${user.id}\`
- **Username:** @${user.username}
- **Display Name:** ${user.full_name || 'Não informado'}

## 📅 Histórico de Análises 

- **Última atualização:** ${lastUpdated}
- **Primeira análise:** ${firstAnalysis}
- **Análises realizadas:** ${analysisCount}
- **Histórico de usernames:** ${user.username_history ? user.username_history.join(' → ') : user.username}

## 🔧 Ferramentas Relacionadas

- [⚙️ Raveninsta](https://github.com/ravenastar-js/raveninsta) - Ferramenta CLI original
- [🗺️ Markmap](https://markmap.js.org/) - Biblioteca de mapas mentais
- [🔒 SECGUIDE OSINT](https://secguide.pages.dev/ferramentas) - Ferramentas OSINT
- [🔒 SECGUIDE Roadmap OSINT](https://secguide.pages.dev/roadmap) - Investigações de Perfis, Registro de Evidências e Inteligência
`;
}

/** @type {Object} Configuração do comando graph */
const config = {
    name: 'graph [perfil]',
    description: 'Gerar mapa interativo usando Markmap CLI',
    options: [
        {
            flags: '-p, --pasta <caminho>',
            description: 'Pasta onde estão os perfis',
            defaultValue: './perfis'
        }
    ]
};

module.exports = {
    execute,
    config
};