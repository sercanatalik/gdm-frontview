'use client';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import BasketGrid from './components/basket-grid';
import { Button } from "@/components/ui/button";


const schema = {
    id: 'string',
    sym: 'string',
    weight: 'float',
    category: 'string',
    name: 'string',
    model: 'string',
    description: 'string',
    ticker: 'string',
    updatedAt: 'string',
    asofDate: 'date',
  };

const BasketOverridesPage = () => {
    
    const [data, setData] = useState([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/overrides/basket');
            setData(response.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const parseCSV = (csvText: string) => {
        const [headerLine, ...lines] = csvText.split('\n');
        const headers = headerLine.split(',').map(header => header.trim());
        return lines
            .filter(line => line.trim()) // Skip empty lines
            .map(line => {
                const values = line.split(',').map(value => value.trim());
                const obj: { [key: string]: any } = headers.reduce((acc: { [key: string]: any }, header, index) => {
                    let value = values[index];
                    header = header.replaceAll('"', '');
                    const type = schema[header as keyof typeof schema];
                    value = value.replaceAll('"', '');
                    // Cast value according to schema type
                    switch (type) {
                        case 'float':
                            console.log('float', value);
                            acc[header] = parseFloat(value) || 0;
                            break;
                        case 'date':
                            acc[header] = new Date(value).toISOString();
                            break;
                        case 'string':
                        default:
                            acc[header] = value || '';
                    }
                    return acc;
                }, {});
                return obj;
            });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const jsonData = parseCSV(text);
            console.log(jsonData);
            await uploadData(jsonData);
        };

        reader.readAsText(file);
    };

    const uploadData = async (jsonData: any) => {
        try {
            const postResponse = await axios.post('/api/overrides/basket', { data: jsonData }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(postResponse);
            await fetchData(); // Refresh data after successful upload
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const downloadSampleCSV = () => {
        // Create headers from schema
        
        // Create a sample row
        const headers = [
            "sym","weight","category","name","model","description","ticker"
        ].join(',');

        // Combine headers and sample row
        const csvContent = `${headers}\n`;
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_basket_override.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
            />
            <div className="absolute top-4 right-10 flex gap-2">
                <Button
                    onClick={downloadSampleCSV}
                    size="sm"
                    variant="outline"
                >
                    Download Sample
                </Button>
                <Button
                    onClick={() => fileInputRef.current?.click()}
                                        size="sm"
                    variant="outline"
                >
                    Upload CSV
                </Button>
            </div>
            </div>
            <div>
            <BasketGrid data={data} /> 
            </div>
        </>
    );
};

export default BasketOverridesPage;
