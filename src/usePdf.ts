import type { FileWithPath } from "@mantine/dropzone";
import { BaseDirectory, writeFile } from "@tauri-apps/plugin-fs";
import { PDFDocument } from "pdf-lib";
import type { WaterMarkItem } from "./App";

export default function usePdf() {
	async function modifyPdf(
		pdfFile: FileWithPath,
		watermarkItem: WaterMarkItem,
	) {
		const pdfDoc = await PDFDocument.load(await pdfFile.arrayBuffer());

		const watermarkImg = await pdfDoc.embedPng(
			await getWaterMarkImg(watermarkItem),
		);
		const { width: wmWidth, height: wmHeight } = watermarkImg;

		for (const page of pdfDoc.getPages()) {
			const { width, height } = page.getSize();
			if (wmWidth > wmHeight) {
				// 透かし画像は横長
				const watermarkDims = watermarkImg.scale(width / wmWidth);

				page.drawImage(watermarkImg, {
					x: page.getWidth() / 2 - watermarkDims.width / 2,
					y: page.getHeight() / 2 - watermarkDims.height / 2,
					width: watermarkDims.width,
					height: watermarkDims.height,
				});
			} else {
				// 透かし画像は縦長
				const watermarkDims = watermarkImg.scale(height / wmHeight);

				page.drawImage(watermarkImg, {
					x: page.getWidth() / 2 - watermarkDims.width / 2,
					y: page.getHeight() / 2 - watermarkDims.height / 2,
					width: watermarkDims.width,
					height: watermarkDims.height,
				});
			}
		}

		const data = await pdfDoc.save();

		// ファイル名生成
		const lastDotIndex = pdfFile.name.lastIndexOf(".");
		const name = pdfFile.name.substring(0, lastDotIndex);
		const extension = pdfFile.name.substring(lastDotIndex + 1);

		await writeFile(`${name}_watermark.${extension}`, data, {
			baseDir: BaseDirectory.Desktop,
		});

		return Promise.resolve();
	}

	async function getWaterMarkImg(watermarkItem: WaterMarkItem) {
		switch (watermarkItem.type) {
			case "draft":
				return await (await fetch("/draft_16-9.png")).arrayBuffer();
			case "confidential":
				return await (await fetch("/confidential_16-9.png")).arrayBuffer();
			case "own":
				throw Error("Not implements.");
		}
	}

	return { modifyPdf } as const;
}
