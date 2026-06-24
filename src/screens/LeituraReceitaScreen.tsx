import React, { useState } from 'react';
import {
    View, Text, TextInput, Button,
    ScrollView, StyleSheet, Alert
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { extrairTextoReceita } from '../services/ocrService';
import { parseReceita, Receita } from '../utils/receitaParser';

const CAMPOS: { key: keyof Receita; label: string }[] = [
    { key: 'od_esferico',   label: 'OD Esférico'   },
    { key: 'od_cilindrico', label: 'OD Cilíndrico'  },
    { key: 'od_eixo',       label: 'OD Eixo'        },
    { key: 'oe_esferico',   label: 'OE Esférico'    },
    { key: 'oe_cilindrico', label: 'OE Cilíndrico'  },
    { key: 'oe_eixo',       label: 'OE Eixo'        },
    { key: 'adicao',        label: 'Adição'          },
    { key: 'dnp',           label: 'DNP'             },
];

export default function LeituraReceitaScreen() {
    const [formulario, setFormulario] = useState<Record<keyof Receita, string | null>>({
        od_esferico: null,
        od_cilindrico: null,
        od_eixo: null,
        oe_esferico: null,
        oe_cilindrico: null,
        oe_eixo: null,
        adicao: null,
        dnp: null,
    });
  const [carregando, setCarregando] = useState(false);

  async function processarImagem(uri: string) {
    setCarregando(true);
    try {
      const texto = await extrairTextoReceita(uri);
      const dados = parseReceita(texto);
      setFormulario(dados);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível ler a receita. Preencha manualmente.');
    } finally {
      setCarregando(false);
    }
  }
    function abrirGaleria() {
        launchImageLibrary({ mediaType: 'photo' }, (res) => {
            if (res.assets?.[0]?.uri) processarImagem(res.assets[0].uri);
        });
    }

    function abrirCamera() {
        launchCamera({ mediaType: 'photo' }, (res) => {
            if (res.assets?.[0]?.uri) processarImagem(res.assets[0].uri);
        });
    }

    function atualizar(key: keyof Receita, valor: string) {
        setFormulario(prev => ({ ...prev, [key]: valor }));
    }

    return (
        <ScrollView style={styles.container}>
            <Button title="Tirar foto da receita" onPress={abrirCamera} />
            <Button title="Escolher da galeria"   onPress={abrirGaleria} />

            {carregando && <Text style={styles.info}>Lendo receita...</Text>}

            {CAMPOS.map(({ key, label }) => (
                <View key={key} style={styles.campo}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                    style={[styles.input, !formulario[key] && styles.inputVazio]}
                    value={formulario[key] ?? ''}
                    onChangeText={(v) => atualizar(key, v)}
                    placeholder={formulario[key] ? '' : 'Preencha manualmente'}
                />
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#fff', padding: 16 },
  info:       { textAlign: 'center', marginVertical: 8, color: '#888' },
  campo:      { marginBottom: 12 },
  label:      { fontWeight: 'bold', marginBottom: 4 },
  input:      { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8 },
  inputVazio: { borderColor: '#e57373', backgroundColor: '#fff3f3' },
});