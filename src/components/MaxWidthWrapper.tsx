import {ReactNode} from "react";
import {cn} from "@/lib/utils";

const MaxWidthWrapper = ({
    className,
    children
                         }: {
    className?: string,
    children: ReactNode
}) => {
    return(
        <div className={cn('mx-auto w-full max-w-screen-xl md:px2.5 items-center text-center', className)}>
            {children}
        </div>
    )
}

export default MaxWidthWrapper;