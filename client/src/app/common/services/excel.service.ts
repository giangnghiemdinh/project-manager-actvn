import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';

type TABLE = any[][];
export interface ExcelColumn {
    title: string,
    width?: number,
    numFmt?: string,
    alignment?: 'left' | 'center' | 'right',
    verticalAlignment?: 'top' | 'middle' | 'bottom',
    wrapText?: boolean
}

export interface ExcelNote {
    cell: string,
    text: string;
}

export interface MergeCell {
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
}

export interface Sheet {
    columns: ExcelColumn[],
    sheetName: string,
    notes?: ExcelNote[],
    data?: any[],
    mergeCells?: MergeCell[]
}

@Injectable({
    providedIn: 'root'
})
export class ExcelService {
    fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    fileExtension = '.xlsx';

    export(fileName: string, sheets: Sheet[]) {
        const workbook = new Workbook();

        for (const sheet of sheets) {
            this.addSheet(workbook, sheet);
        }

        // Generate & Save Excel File
        workbook.xlsx.writeBuffer().then((dataRow) => {
            const blob = new Blob([dataRow], {type: this.fileType});
            FileSaver.saveAs(blob, fileName + '_' + new Date().getTime() + this.fileExtension);
        });
    }

    private addSheet(workbook: Workbook, options: Sheet) {
        const worksheet = workbook.addWorksheet(options.sheetName, {properties: {tabColor: {argb: 'FFC0000'}}});
        const headers = options.columns.map(c => c.title);
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.font = {
                name: 'Times New Roman',
                family: 2,
                bold: true,
                size: 12,
            };
            cell.alignment = {
                vertical: 'middle', horizontal: 'center'
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'CCCCCC'},
            };
            cell.border = {
                top: {style: 'thin'},
                left: {style: 'thin'},
                right: {style: 'thin'},
                bottom: {style: 'thin'}
            };
        });
        worksheet.columns = [];
        for (let i = 0; i < options.columns.length; i++) {
            const column = options.columns[i];
            worksheet.getColumn(i + 1).width = column.width || 25;
            column.numFmt && (worksheet.getColumn(i + 1).numFmt = column.numFmt);
        }

        for (const row of (options.data || [])) {
            const currentRow = worksheet.addRow(Object.values(row));
            currentRow.eachCell((cell, cellIndex) => {
                const column = options.columns[cellIndex - 1];
                cell.alignment = {
                    horizontal: column.alignment || 'left',
                    vertical: column.verticalAlignment || 'top',
                    wrapText: column.wrapText || false
                };
                cell.border = {
                    top: {style: 'thin'},
                    left: {style: 'thin'},
                    right: {style: 'thin'},
                    bottom: {style: 'thin'}
                };
            });
        }

        worksheet.eachRow({includeEmpty: true}, (row, rowNumber) => {
            row.font = {
                name: 'Times New Roman',
                family: 2,
                bold: rowNumber === 1,
                size: 12,
            };
        });

        for (let note of (options?.notes || [])) {
            worksheet.getCell(note.cell).note = {
                texts: [
                    {'font': {'name': 'Arial', 'family': 2, 'italic': true, 'size': 12}, 'text': note.text},
                ],
                margins: {
                    insetmode: 'custom',
                    inset: [0.25, 0.25, 0.35, 0.35]
                },
                protection: {
                    locked: 'True',
                    lockText: 'False'
                },
                editAs: 'twoCells',
            }
        }

        for (let merge of (options?.mergeCells || [])) {
            worksheet.mergeCells(merge.startRow, merge.startCol, merge.endRow, merge.endCol);
        }
    }

    import(file: any, callBackFn: any) {

        const listOfData: any[] = [];

        const reader: FileReader = new FileReader();

        reader.onload = (e: any) => {
            // read and convert excel data to binary type
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'buffer'});

            // Read all sheet
            const sheetNames = wb.SheetNames;

            // forEach in number of sheets
            sheetNames.forEach(sheetName => {
                const ws: XLSX.WorkSheet = wb.Sheets[sheetName];
                const convertedData: any = (XLSX.utils.sheet_to_json(ws, {header: 1, blankrows: false})) as TABLE;
                listOfData.push(convertedData);
            });
            if (listOfData.length > 0) {
                callBackFn(null, listOfData);
            }
        };

        reader.onerror = (err: any) => callBackFn(err, null);

        reader.readAsArrayBuffer(file);
    }
}
