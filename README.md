# 👓 VisionFrame AI — Teste de Face Tracking

Protótipo de prova virtual de óculos desenvolvido como parte do projeto **VisionFrame AI** para as **Óticas Corrente**, no programa **Residência em TIC 55**.

O app usa **MediaPipe** para detectar 478 pontos do rosto em tempo real e renderiza um modelo 3D de óculos sobre o rosto usando **Three.js**, tudo rodando dentro de uma **WebView React Native**.

---

## ✨ O que ele faz

- Detecta o rosto em tempo real pela câmera frontal
- Posiciona um modelo 3D de óculos (`.glb`) sobre os olhos
- Rotaciona o modelo acompanhando os movimentos da cabeça (cima, baixo, esquerda, direita, inclinação)
- Usa uma **malha de oclusão invisível** para que as hastes somam atrás do rosto ao virar — igual filtro do Instagram 😎

---

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| React Native | App mobile (Android/iOS) |
| react-native-webview | Embute o HTML com a câmera e AR no app |
| MediaPipe Face Mesh | Detecção dos 478 landmarks faciais |
| Three.js r128 | Renderização 3D do modelo de óculos |
| GLTFLoader | Carregamento do modelo `.glb` |

---

## 📁 Estrutura

```
├── App.tsx              # Ponto de entrada — renderiza a WebView
├── assets/
│   ├── index.html       # Toda a lógica de AR (MediaPipe + Three.js)
│   └── reading_glasses.glb  # Modelo 3D dos óculos
```

---

## 🚀 Como rodar

### Pré-requisitos

- Node.js LTS
- Java JDK 17
- Android Studio (com Android SDK e AVD configurados)
- Yarn
- ADB configurado nas variáveis de ambiente

### Instalação

```bash
# Clone o repositório
git clone https://github.com/isadorakramm/Gatinhos.git
cd Gatinhos

# Instale as dependências
yarn install
```

### Rodando o app

Você vai precisar de **três terminais** abertos ao mesmo tempo:

**Terminal 1 — Metro Bundler:**
```bash
yarn start
```

**Terminal 2 — Servidor local para o modelo 3D:**
```bash
cd assets
npx serve . --cors -p 3000
```

> O Three.js precisa de um servidor HTTP para carregar o arquivo `.glb`. Esse servidor precisa ficar rodando durante todo o desenvolvimento.

**Terminal 3 — Instala no dispositivo:**
```bash
yarn android
```

Depois de instalado, cria a ponte entre o celular e o computador:
```bash
adb reverse tcp:8081 tcp:8081
```

---

## ⚠️ Problemas comuns

**"Erro modelo: ..."** no canto da tela

O servidor de assets não está rodando. Vai no terminal e roda `npx serve . --cors -p 3000` dentro da pasta `assets`.

**"getUserMedia não disponível"**

O `adb reverse` não foi rodado. Roda `adb reverse tcp:8081 tcp:8081` e dá reload no app.

**App instala mas câmera não aparece**

Vai em Configurações > Apps > Gatinhos > Permissões e certifica que a câmera está permitida.

---

## 💡 Como funciona

### Arquitetura

A tela tem três camadas empilhadas:

```
┌─────────────────────────────┐
│  <canvas> Three.js          │  ← óculos 3D + malha de oclusão
├─────────────────────────────┤
│  <video> câmera ao vivo     │  ← fundo (espelhado com scaleX -1)
└─────────────────────────────┘
```

### A cada frame

1. MediaPipe processa a imagem e retorna 478 landmarks (x, y, z normalizados)
2. Os landmarks são convertidos para coordenadas 3D do Three.js
3. A malha de oclusão é atualizada com as novas posições
4. O óculos é reposicionado e rerotacionado
5. Three.js renderiza a cena

### Occlusion mesh

A parte mais legal! Uma malha 3D invisível é construída sobre o rosto usando os 478 landmarks. O material tem `colorWrite: false` (não aparece na tela) mas `depthWrite: true` (escreve no depth buffer). O Three.js descarta automaticamente os pixels dos óculos que ficam atrás dessa malha, fazendo as hastes sumirem quando o rosto passa na frente. É a mesma técnica usada pelo Instagram e Snapchat nos filtros AR.

---

## 📌 Observações

- Este repositório é um **protótipo/MVP** desenvolvido para exploração técnica, não um produto final
- A abordagem WebView foi escolhida para simplificar a integração do MediaPipe JS, que foi projetado para rodar no browser
- Para um produto final, a migração para **React Native Vision Camera** com worklets nativos melhoraria significativamente a performance

---

## Autora

**Isadora Kramm** — Residência em TIC 55 
