"use client"
import {Document, Page, pdfjs} from "react-pdf";

import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import {ChevronDown, ChevronUp, Loader2, RotateCw, Search} from "lucide-react";
import {useToast} from "@/components/ui/use-toast";
import {useResizeDetector} from "react-resize-detector";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {cn} from "@/lib/utils";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import "simplebar-react/dist/simplebar.min.css";
import SimpleBar from "simplebar-react";
import PDFFullScreen from "@/components/PDFFullScreen";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PDFRendererProps {
    url: string
}

const PDFRenderer = ({url}: PDFRendererProps) => {
    const {toast} = useToast();
    const [numPages, setNumPages] = useState<number>();
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState<number>(1);
    const [rotation, setRotation] = useState<number>(0);
    const [renderedScale, setRenderedScale] = useState<number | null>(null);

    const isLoading = renderedScale !== scale;

    const  customPageValidator = z.object({
        page: z.string().refine((num) => Number(num) > 0 && Number(num) <= numPages! )
    })

    type TCustomPageValidator = z.infer<typeof  customPageValidator>

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm<TCustomPageValidator>({
        defaultValues: {
            page: "1"
        },
        resolver: zodResolver(customPageValidator)
    })

    const {width, ref} = useResizeDetector();

    const handlePageSubmit = ({ page }: TCustomPageValidator) => {
        setCurrentPage(Number(page))
        setValue("page", String(page))
    }

    return(
        <div className="w-full mt-1 bg-white rounded-md shadow flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Button
                        disabled={currentPage <= 1}
                        variant="ghost"
                        aria-label="previous-page"
                        onClick={() => {
                            setCurrentPage((prev) => (prev - 1 > 1 ? prev - 1 : 1))
                            setValue("page", String(currentPage - 1))
                    }}>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1.5">
                        <Input
                            {...register("page")}
                            className={cn('w-12 h-8', errors.page && "focus-visible:ring-red-500")}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubmit(handlePageSubmit)()
                            }}
                            }
                        />
                        <p className="text-zinc-700 text-sm space-x-1">
                            <span>/</span>
                            <span>{numPages ?? "x"}</span>
                        </p>
                    </div>

                    <Button disabled={
                        numPages === undefined ||
                        currentPage === numPages
                    } variant="ghost" aria-label="next-pagr">
                        <ChevronUp
                            className="h-4 w-4"
                            onClick={() => {
                                setCurrentPage((prev) => prev + 1 > numPages! ? numPages! : prev + 1)
                                setValue("page", String(currentPage + 1))
                            }}
                        />
                    </Button>
                </div>
                <div className="space-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="gap-1.5"
                                aria-label="zoom"
                                variant="ghost"
                            >
                                <Search className="h-4 w-4" />
                                {scale * 100}%
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => setScale(1)}>
                                100%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(1.5)}>
                               150%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(2)}>
                                200%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(2.5)}>
                                250%
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="ghost"
                        aria-label="rotate 90 degrees"
                        onClick={() => setRotation((prev) => prev + 90)}
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>
                    <PDFFullScreen fileUrl={url} />
                </div>
            </div>
            <div className="flex-1 w-full max-h-screen">
                <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
                    <div ref={ref}>
                        <Document
                            onLoadSuccess={({numPages}) => setNumPages(numPages)}
                            loading={
                                <div className="flex justify-center">
                                    <Loader2 className="my-24 h-6 w-6 animate-spin"/>
                                </div>
                            }
                            onLoadError={() => {
                                toast({
                                    title: 'Error loading PDF',
                                    description: 'Please try again later.',
                                    variant: "destructive"
                                })
                            }}
                            file={url}
                            className="max-h-full">
                            {isLoading && renderedScale ? (
                                <Page
                                    width={width}
                                    pageNumber={currentPage}
                                    scale={scale}
                                    rotate={rotation}
                                    key={"@" + renderedScale}
                                />
                            ) : null }
                            <Page
                                className={cn(isLoading ? "hidden" : "")}
                                width={width}
                                pageNumber={currentPage}
                                scale={scale}
                                rotate={rotation}
                                key={"@" + scale}
                                loading={
                                <div className="flex justify-center">
                                    <Loader2 className="my-24 h-4 w-4 animate-spin" />
                                </div>
                                }
                                onRenderSuccess={() => setRenderedScale(scale)}
                            />
                        </Document>
                    </div>
                </SimpleBar>
            </div>
        </div>
    )
}

export default PDFRenderer;