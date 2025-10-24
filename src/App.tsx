import {
	Box,
	Button,
	FileButton,
	Group,
	LoadingOverlay,
	Radio,
	Stack,
	Text,
} from "@mantine/core";
import { Dropzone, type FileWithPath, PDF_MIME_TYPE } from "@mantine/dropzone";
import "./App.css";
import { useDisclosure } from "@mantine/hooks";
import { IconFileTypePdf, IconUpload, IconX } from "@tabler/icons-react";
import { useState } from "react";
import usePdf from "./usePdf";

export type WaterMarkType = "draft" | "confidential" | "own";
export type WaterMarkItem =
	| { type: "draft" }
	| { type: "confidential" }
	| { type: "own"; path: string };

export default function App() {
	const [progressVisible, { open: openProgress, close: closeProgress }] =
		useDisclosure(false);

	const [radioSel, setRadioSel] = useState<WaterMarkType>("draft");

	const { modifyPdf } = usePdf();

	function _modifyPdf(files: FileWithPath[]) {
		if (files.length !== 1 || files[0] === null) {
			return;
		}
		const pdfFile = files[0];
		const watermarkItem = getWaterMarkItem(radioSel); // TODO:
		openProgress();
		modifyPdf(pdfFile, watermarkItem)
			.catch((e) => {
				alert(`PDF生成に失敗しました。 cause:${e}`);
			})
			.finally(() => {
				closeProgress();
			});
	}

	function getWaterMarkItem(type: WaterMarkType, path?: string) {
		switch (type) {
			case "draft":
			case "confidential":
				return { type: type };
			case "own":
				if (path === undefined) {
					throw Error("path is undefined.");
				}
				return { type: type, path: path };
		}
	}

	return (
		<main>
			<Box pos="relative">
				<LoadingOverlay
					visible={progressVisible}
					zIndex={1000}
					overlayProps={{ radius: "sm", blur: 2 }}
				/>

				<Stack h="100dvh" p="16px">
					<Group>
						<Radio.Group
							name="watermark-image"
							label="透かし画像選択"
							withAsterisk
							value={radioSel}
							onChange={(val) => setRadioSel(val as WaterMarkType)}
						>
							<Group mt="xs">
								<Radio value="draft" label="DRAFT" />
								<Radio value="confidential" label="Confidential" />
								<Radio value="own" label="自分で選ぶ" disabled />
								<FileButton
									onChange={(e) => console.debug(e)}
									accept="image/png"
								>
									{(props) => (
										<Button {...props} size="xs" disabled>
											選択
										</Button>
									)}
								</FileButton>
							</Group>
						</Radio.Group>
					</Group>
					<Dropzone
						onDrop={_modifyPdf}
						onReject={(files) => console.log("rejected files", files)}
						accept={PDF_MIME_TYPE}
						style={{ flexGrow: 1 }}
					>
						<Group
							justify="center"
							align="center"
							gap="xl"
							style={{ pointerEvents: "none", height: "100%", flexGrow: 1 }}
						>
							<Dropzone.Accept>
								<IconUpload
									size={52}
									color="var(--mantine-color-blue-6)"
									stroke={1.5}
								/>
							</Dropzone.Accept>
							<Dropzone.Reject>
								<IconX
									size={52}
									color="var(--mantine-color-red-6)"
									stroke={1.5}
								/>
							</Dropzone.Reject>
							<Dropzone.Idle>
								<IconFileTypePdf
									size={40}
									color="var(--mantine-color-dimmed)"
									stroke={1.5}
								/>
							</Dropzone.Idle>

							<div>
								<Text size="xl" inline>
									PDFファイルを選択
								</Text>
								<Stack gap="4px" mt="8px">
									<Text size="sm" c="dimmed" inline>
										PDFファイルをドラッグ
									</Text>
									<Text size="sm" c="dimmed" inline>
										or
									</Text>
									<Text size="sm" c="dimmed" inline>
										クリックしてファイル選択
									</Text>
								</Stack>
							</div>
						</Group>
					</Dropzone>
				</Stack>
			</Box>
		</main>
	);
}
