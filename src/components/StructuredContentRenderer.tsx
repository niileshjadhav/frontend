import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  Button,
} from "@mui/material";
import { TrendingUp as TrendingUpIcon } from "@mui/icons-material";

interface StructuredContentProps {
  content: any;
  onSuggestionClick?: (suggestion: string) => void;
}

const StructuredContentRenderer: React.FC<StructuredContentProps> = ({
  content,
  onSuggestionClick,
}) => {
  if (!content || typeof content !== "object") {
    return null;
  }

  const renderStatsCard = (data: any) => (
    <Card
      elevation={0}
      sx={{
        maxWidth: "350px",
      }}
    >
      <CardContent sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem" }}
            >
              {data.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontSize: "0.8rem" }}
            >
              {data.region} Region • Table: {data.table_name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {data.stats?.map((stat: any, index: number) => (
            <Box key={index} sx={{ flex: "1 1 auto" }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: "6px",
                  backgroundColor: stat.highlight ? "#f8fafc" : "#ffffff",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: stat.highlight ? "#0ea5e9" : "#0f172a",
                    fontSize: stat.type === "number" ? "1.2rem" : "0.9rem",
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#000000",
                      mb: 0.25,
                      fontWeight: 500,
                      fontSize: "0.75rem",
                    }}
                  >
                    {stat.label}
                  </Typography>
                      {stat.type === "number" && (
                    <TrendingUpIcon
                      sx={{ color: "#059669", fontSize: 14, mt: 0.25 }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const renderConfirmationCard = (data: any) => {
    const isDelete = data.title?.toLowerCase().includes("delete");

    return (
      <Card
        elevation={0}
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          maxWidth: "400px",
        }}
      >
        <CardContent sx={{ p: 3, pt: 0, textAlign: "center" }}>
          <Box sx={{ mb: 2, textAlign: "left" }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                fontSize: "1rem",
                mb: 0.5,
              }}
            >
              {data.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontSize: "0.8rem", mb: 2 }}
            >
              {data.region} Region
            </Typography>
          </Box>

          <Box
            sx={{
              border: "2px solid #f87171",
              borderRadius: "8px",
              py: 2,
              px: 6,
              mb: 2,
              backgroundColor: "#ffffff",
              width: "100%",
              maxWidth: "320px",
              mx: "auto",
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: "#dc2626",
                fontSize: "2.5rem",
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {data.count?.toLocaleString() || "0"}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#374151", fontWeight: 500, fontSize: "1rem" }}
            >
              Records to {isDelete ? "delete" : "archive"}
            </Typography>
          </Box>

          {/* Instructions */}
          <Typography
            variant="body2"
            sx={{ color: "#747880ff", mb: 3, fontSize: "0.75rem" }}
          >
            {data.instructions ||
              `Click "CONFIRM ${
                isDelete ? "DELETE" : "ARCHIVE"
              }" to proceed or "CANCEL" to abort.`}
          </Typography>

          {/* Delete warning */}
          {isDelete && (
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "#b91c1c",
                mb: 2,
              }}
            >
              This action cannot be undone!
            </Typography>
          )}

          {/* Action buttons */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() =>
                onSuggestionClick?.(
                  `CONFIRM ${isDelete ? "DELETE" : "ARCHIVE"}`
                )
              }
              sx={{
                backgroundColor: "#dc2626",
                color: "#ffffff",
                fontWeight: 500,
                fontSize: "0.9rem",
                px: 3,
                py: 1,
                borderRadius: "6px",
                textTransform: "none",
                minWidth: "160px",
                "&:hover": {
                  backgroundColor: "#b91c1c",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              CONFIRM {isDelete ? "DELETE" : "ARCHIVE"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => onSuggestionClick?.("CANCEL")}
              sx={{
                backgroundColor: "#ffffff",
                color: "#6b7280",
                fontWeight: 500,
                fontSize: "0.9rem",
                px: 3,
                py: 1,
                borderRadius: "6px",
                textTransform: "none",
                minWidth: "100px",
                border: "1px solid #d1d5db",
                "&:hover": {
                  backgroundColor: "#f9fafb",
                  borderColor: "#9ca3af",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              CANCEL
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderSuccessCard = (data: any) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: "12px",
        maxWidth: "350px",
      }}
    >
      <CardContent sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem" }}
            >
              {data.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontSize: "0.8rem" }}
            >
              {data.region} Region
            </Typography>
          </Box>
        </Box>

        {data.details && (
          <Box sx={{ mt: 1.5 }}>
            {data.details.map((detail: any, index: number) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ color: "#374151", mb: 0.25, fontSize: "0.8rem" }}
              >
                • {detail}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderConversationalCard = (data: any) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: "12px",
        maxWidth: "100%",
        width: "100%",
      }}
    >
      <CardContent sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem" }}
            >
              {data.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontSize: "0.8rem" }}
            >
              {data.region} • {data.user_role} Access
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              color: "#374151",
              fontSize: "0.85rem",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {data.content}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderErrorCard = (data: any) => (
    <Card
      elevation={0}
      sx={{
        maxWidth: "100%",
        width: "100%",
      }}
    >
      <CardContent sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem" }}
            >
              {data.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontSize: "0.8rem" }}
            >
              {data.region} Region
            </Typography>
          </Box>
        </Box>

        <Alert
          severity="error"
          sx={{
            borderRadius: "8px",
            backgroundColor: "#fef2f2",
            border: "1px solid #ef4444",
            mb: 1.5,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
            {data.error_message}
          </Typography>
        </Alert>

        {data.suggestions && data.suggestions.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.8,
                mb: 1,
                display: "block",
                fontWeight: 600,
                textTransform: "uppercase",
                fontSize: "0.7rem",
                letterSpacing: "0.05em",
              }}
            >
              Suggested Actions
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {data.suggestions.map((suggestion: string, index: number) => (
                <Chip
                  key={index}
                  label={suggestion}
                  size="small"
                  clickable
                  onClick={() => onSuggestionClick?.(suggestion)}
                  sx={{
                    fontSize: "0.75rem",
                    backgroundColor: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #ef4444",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#fee2e2",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderCancelledCard = (data: any) => (
    <Card
      elevation={0}
      sx={{
        maxWidth: "350px",
      }}
    >
      <CardContent sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem" }}
            >
              {data.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontSize: "0.8rem" }}
            >
              {data.region} Region
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              color: "#000000",
              fontSize: "0.85rem",
              lineHeight: 1.5,
              mb: 1,
            }}
          >
            {data.message}
          </Typography>
          {data.details &&
            data.details.map((detail: string, index: number) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ color: "#6b7280", fontSize: "0.8rem", mb: 0.25 }}
              >
                • {detail}
              </Typography>
            ))}
        </Box>
      </CardContent>
    </Card>
  );

  const renderWelcomeCard = (data: any) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: "12px",
        maxWidth: "100%",
        width: "100%",
      }}
    >
      <CardContent sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <Typography variant="h4" sx={{ mr: 1, fontSize: "1.5rem" }}>
            {data.icon}
          </Typography>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem" }}
            >
              {data.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontSize: "0.8rem" }}
            >
              {data.region} • {data.user_role} Access
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              color: "#374151",
              fontSize: "0.85rem",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              fontWeight: 500,
            }}
          >
            {data.content}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderDatabaseOverviewCard = (data: any) => (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <CardContent sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#000000", fontSize: "1.1rem" }}
            >
              Database Statistics
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontSize: "0.8rem" }}
            >
              {data.region} Region • {data.summary?.main_tables_count || 0} main
              tables • {data.summary?.archive_tables_count || 0} archive tables
            </Typography>
          </Box>
        </Box>

        {/* Main Tables */}
        {data.main_tables && data.main_tables.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "#000000",
                mb: 1,
                fontSize: "0.9rem",
              }}
            >
              🗂️ Main Tables
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {data.main_tables.map((table: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    p: 1.5,
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: "#000000",
                        fontSize: "0.85rem",
                      }}
                    >
                      {table.name}
                    </Typography>
                    {table.error ? (
                      <Typography
                        variant="body2"
                        sx={{ color: "#ef4444", fontSize: "0.75rem" }}
                      >
                        ❌ Error: {table.error}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", fontSize: "0.75rem" }}
                      >
                        Records older than {table.age_days} days:{" "}
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 900,
                            color: "#f59e0b",
                            fontSize: "0.8rem",
                          }}
                        >
                          {table.age_based_count?.toLocaleString() || "0"}
                        </Typography>
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 900,
                        color: "#0ea5e9",
                        fontSize: "1.0rem",
                      }}
                    >
                      {table.total_records?.toLocaleString() || "0"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748b", fontSize: "0.65rem" }}
                    >
                      Total records
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Archive Tables */}
        {data.archive_tables && data.archive_tables.length > 0 && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "#000000",
                mb: 1,
                fontSize: "0.9rem",
              }}
            >
              📦 Archive Tables
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {data.archive_tables.map((table: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    p: 1.5,
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: "#000000",
                        fontSize: "0.85rem",
                      }}
                    >
                      {table.name}
                    </Typography>
                    {table.error ? (
                      <Typography
                        variant="body2"
                        sx={{ color: "#ef4444", fontSize: "0.75rem" }}
                      >
                        ❌ Error: {table.error}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", fontSize: "0.75rem" }}
                      >
                        Records older than {table.age_days} days:{" "}
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 900,
                            color: "#f59e0b",
                            fontSize: "0.8rem",
                          }}
                        >
                          {table.age_based_count?.toLocaleString() || "0"}
                        </Typography>
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 900,
                        color: "#d97706",
                        fontSize: "1.0rem",
                      }}
                    >
                      {table.total_records?.toLocaleString() || "0"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748b", fontSize: "0.65rem" }}
                    >
                      Total records
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Main rendering logic
  switch (content.type) {
    case "stats_card":
      return renderStatsCard(content);
    case "database_overview":
      return renderDatabaseOverviewCard(content);
    case "confirmation_card":
      return renderConfirmationCard(content);
    case "success_card":
      return renderSuccessCard(content);
    case "conversational_card":
      return renderConversationalCard(content);
    case "welcome_card":
      return renderWelcomeCard(content);
    case "error_card":
      return renderErrorCard(content);
    case "cancelled_card":
      return renderCancelledCard(content);
    default:
      // Fallback to plain JSON display for unknown types
      return (
        <Box
          sx={{
            p: 2,
            borderRadius: "8px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography
            variant="body2"
            component="pre"
            sx={{ whiteSpace: "pre-wrap" }}
          >
            {JSON.stringify(content, null, 2)}
          </Typography>
        </Box>
      );
  }
};

export default StructuredContentRenderer;
